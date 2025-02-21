import { DurableObject } from "cloudflare:workers"
import { setup } from "@repo/game/setup"
import type { Env } from "./types"
import type { WsMessage, Session, State } from "@repo/game/types"
import { deleteTile, initTileDb, isFree } from "@repo/game/tile"
import { cardsMatch } from "@repo/game/deck"
import { tiltMap } from "@repo/game/tilt"
import {
  getPointsWithCombo,
  getPowerups,
  initPowerupsDb,
} from "@repo/game/powerups"
import { initSelectionsDb, type Selection } from "@repo/game/selection"

export class GameState extends DurableObject {
  sessions: Map<WebSocket, Session>
  storage: DurableObjectStorage
  state!: State
  timer!: number

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.sessions = new Map()
    this.storage = ctx.storage

    ctx.blockConcurrencyWhile(async () => {
      const selections = await this.initState("selections", () => ({}))
      const players = await this.initState("players", () => ({}))
      const tiles = await this.initState("tiles", () => setup())
      const timer = (await this.storage.get("timer")) as number
      const powerups = await this.initState("powerups", () => ({}))
      const points = await this.initState("points", () => 0)

      this.timer = timer
      this.state = { tiles, players, selections, powerups, points }
    })

    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment()
      this.sessions.set(ws, { ...meta })
    }
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    if (typeof message !== "string") return

    try {
      const parsedMsg: WsMessage = JSON.parse(message)
      const session = this.sessions.get(ws)
      if (!session) return

      if (session.quit) {
        ws.close(1011, "WebSocket broken.")
        return
      }

      switch (parsedMsg.type) {
        case "sessions-move": {
          session.x = parsedMsg.x
          session.y = parsedMsg.y
          ws.serializeAttachment(session)
          this.broadcast({
            type: "sessions-move",
            id: session.id,
            x: session.x,
            y: session.y,
          })
          break
        }

        case "select-tile": {
          this.selectTile(parsedMsg.selection, session)
          break
        }

        case "sessions-fetch": {
          const sessions: Session[] = []
          for (const [_, session] of this.sessions) {
            sessions.push(session)
          }
          const wsMessage: WsMessage = {
            type: "sessions-sync",
            sessions,
          }
          ws.send(JSON.stringify(wsMessage))
          break
        }

        default:
          break
      }
    } catch (err) {
      console.error(err)
    }
  }

  async closeOrErrorHandler(ws: WebSocket) {
    const session = this.sessions.get(ws)
    if (!session) return

    session.quit = true

    this.sessions.delete(ws)
    this.broadcast({ type: "sessions-quit", id: session.id })
  }

  async webSocketClose(ws: WebSocket) {
    this.closeOrErrorHandler(ws)
  }

  async webSocketError(ws: WebSocket) {
    this.closeOrErrorHandler(ws)
  }

  closeSessions() {
    for (const ws of this.ctx.getWebSockets()) {
      ws.close()
    }
  }

  broadcast(message: WsMessage) {
    const quitters: Session[] = []

    this.sessions.forEach((session, webSocket) => {
      try {
        webSocket.send(JSON.stringify(message))
      } catch (err) {
        session.quit = true
        quitters.push(session)
        this.sessions.delete(webSocket)
      }
    })

    for (const quitter of quitters) {
      if (quitter.id) {
        this.broadcast({ type: "sessions-quit", id: quitter.id })
      }
    }
  }

  async fetch(request: Request) {
    const url = new URL(request.url)
    const webSocketPair = new WebSocketPair()
    const client = webSocketPair[0]
    const server = webSocketPair[1]

    this.ctx.acceptWebSocket(server)

    const id = url.searchParams.get("id")
    if (!id) {
      return new Response("Missing id", { status: 400 })
    }

    const sessionInitialData: Session = { id, x: -1, y: -1, quit: false }
    server.serializeAttachment(sessionInitialData)

    this.sessions.set(server, sessionInitialData)
    this.broadcast({ type: "sessions-join", id, session: sessionInitialData })

    const numPlayers = Object.keys(this.state.players).length
    if (numPlayers < 2) {
      this.state.players[id] = { id, order: numPlayers }
    }

    // TODO: depends of 1 or 2 player game
    // We are ready to start the game
    if (numPlayers === 1) {
      this.timer = new Date().getTime()
      this.storage.put("timer", this.timer)
    }

    this.broadcast({ type: "init-state", state: this.state, timer: this.timer })

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }

  async initState<T>(key: string, defaultValue: () => T) {
    let state = (await this.storage.get(key)) as T

    if (!state) {
      state = defaultValue()
      await this.storage.put(key, state)
    }

    return state
  }

  async saveState(state: State) {
    this.state = state

    await Promise.all(
      Object.keys(state).map((key) =>
        this.storage.put(key, state[key as keyof State]),
      ),
    )

    this.broadcast({ type: "sync", state: this.state })
  }

  selectTile(selection: Selection, session: Session) {
    const tileDb = initTileDb(this.state.tiles)
    const powerupsDb = initPowerupsDb(this.state.powerups)
    const selectionsDb = initSelectionsDb(this.state.selections)

    const state = {
      tiles: tileDb.byId,
      powerups: powerupsDb.byId,
      selections: selectionsDb.byId,
      players: this.state.players,
      points: this.state.points,
    }

    const tile = tileDb.get(selection.tileId)
    if (!tile) throw new Error("Tile not found")

    if (!isFree(tileDb, tile, powerupsDb, session.id)) {
      selectionsDb.del(selection.id)
      this.saveState(state)
      return
    }

    const firstSelection = Object.values(this.state.selections).find(
      (sel) => sel.playerId === session.id,
    )

    if (!firstSelection) {
      selectionsDb.set(selection.id, { ...selection, confirmed: true })
      this.saveState(state)
      return
    }

    if (firstSelection.id === selection.id) {
      selectionsDb.del(selection.id)
      this.saveState(state)
      return
    }

    const firstTile = tileDb.get(firstSelection.tileId)
    if (!firstTile || firstTile.deletedBy) {
      selectionsDb.del(selection.id)
      this.saveState(state)
      return
    }

    selectionsDb.del(firstSelection.id)

    if (cardsMatch(firstTile.card, tile.card)) {
      deleteTile(tileDb, tile, session.id)
      deleteTile(tileDb, firstTile, session.id)
      tiltMap(tileDb, tile)
      getPowerups(powerupsDb, session.id, tile)
      selectionsDb.del(selection.id)

      this.state.points += getPointsWithCombo(powerupsDb, session.id, tile)
    } else {
      this.state.points = Math.max(this.state.points - 2, 0)
    }

    // TODO: check game over if no more available moves
    // TODO: check game over if no more available moves
    // TODO: check game over if strength is 0
    // TODO: increase points and sync
    this.saveState({
      ...state,
      points: this.state.points,
    })

    return
  }
}
