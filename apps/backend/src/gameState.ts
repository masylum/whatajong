import { DurableObject } from "cloudflare:workers"
import { setup } from "@repo/game/setup"
import type { Env } from "./types"
import type { WsMessage, Session, State } from "@repo/game/types"
import { deleteTile, initTileDb, isFree } from "@repo/game/tile"
import { cardsMatch } from "@repo/game/deck"
import { gameOverCondition } from "@repo/game/game"
import { resolveWinds } from "@repo/game/winds"
import {
  getPointsWithCombo,
  getPowerups,
  initPowerupsDb,
} from "@repo/game/powerups"
import { initSelectionsDb, type Selection } from "@repo/game/selection"
import { initPlayersDb } from "@repo/game/player"

const GAME_TIMEOUT = 1000 * 60 * 30 // 30 minutes
const GAME_COUNTDOWN = 3_000 // 3 seconds

export class GameState extends DurableObject {
  sessions: Map<WebSocket, Session>
  storage: DurableObjectStorage
  state!: State

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.sessions = new Map()
    this.storage = ctx.storage

    ctx.blockConcurrencyWhile(async () => {
      const selections = await this.initState("selections", () => ({}))
      const players = await this.initState("players", () => ({}))
      const game = await this.initState("game", () => ({}) as const)
      const powerups = await this.initState("powerups", () => ({}))
      const tiles = await this.initState("tiles", () => setup())

      this.storage.setAlarm(Date.now() + GAME_TIMEOUT)
      this.state = { tiles, selections, powerups, game, players }
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

        case "restart-game": {
          this.state.game = {
            startedAt: new Date().getTime() + 3_000,
          }
          this.state.tiles = setup()
          this.state.selections = {}
          this.state.powerups = {}

          await this.saveState({
            game: this.state.game,
            tiles: this.state.tiles,
            selections: this.state.selections,
            powerups: this.state.powerups,
            players: this.state.players,
          })
          break
        }

        case "select-tile": {
          await this.selectTile(parsedMsg.selection, session)
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
    const modality = url.searchParams.get("modality") ?? "solo"

    if (!id) {
      return new Response("Missing id", { status: 400 })
    }

    const sessionInitialData: Session = { id, x: -1, y: -1, quit: false }
    server.serializeAttachment(sessionInitialData)

    this.sessions.set(server, sessionInitialData)
    this.broadcast({ type: "sessions-join", id, session: sessionInitialData })

    try {
      const playerIds = new Set(
        Object.values(this.state.players).map((player) => player.id),
      )

      if (playerIds.size === 0) {
        this.state.players[id] = { id, points: 0, order: 0 }

        if (modality === "solo") {
          this.state.game.startedAt = new Date().getTime()
        }
      } else if (!playerIds.has(id) && playerIds.size === 1) {
        this.state.players[id] = { id, points: 0, order: 1 }

        if (modality === "duel") {
          // start the game!
          this.storage.setAlarm(Date.now() + GAME_COUNTDOWN)
        }
      }

      return new Response(null, {
        status: 101,
        webSocket: client,
      })
    } finally {
      await this.saveState({
        selections: this.state.selections,
        players: this.state.players,
        powerups: this.state.powerups,
        tiles: this.state.tiles,
        game: this.state.game,
      })
    }
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
      Object.keys(this.state).map((key) =>
        this.storage.put(key, this.state[key as keyof State]),
      ),
    )

    this.broadcast({ type: "sync", state: this.state })
  }

  async selectTile(selection: Selection, session: Session) {
    const tileDb = initTileDb(this.state.tiles)
    const powerupsDb = initPowerupsDb(this.state.powerups)
    const selectionsDb = initSelectionsDb(this.state.selections)
    const playersDb = initPlayersDb(this.state.players)
    const playerId = session.id

    const player = playersDb.get(playerId)
    if (!player) throw new Error("Player not found")

    const tile = tileDb.get(selection.tileId)
    if (!tile) throw new Error("Tile not found")

    try {
      if (!isFree(tileDb, tile, powerupsDb, playerId)) {
        selectionsDb.del(selection.id)
        return
      }

      const firstSelection = selectionsDb.findBy({ playerId })
      if (!firstSelection) {
        selectionsDb.set(selection.id, { ...selection, confirmed: true })
        return
      }

      if (firstSelection.id === selection.id) {
        selectionsDb.del(selection.id)
        return
      }

      const firstTile = tileDb.get(firstSelection.tileId)
      if (!firstTile || firstTile.deletedBy) {
        selectionsDb.del(selection.id)
        return
      }

      selectionsDb.del(firstSelection.id)

      if (cardsMatch(firstTile.card, tile.card)) {
        deleteTile(tileDb, tile, playerId)
        deleteTile(tileDb, firstTile, playerId)
        resolveWinds(tileDb, powerupsDb, tile)
        getPowerups(powerupsDb, playerId, tile)
        selectionsDb.del(selection.id)

        const points =
          player.points + getPointsWithCombo(powerupsDb, playerId, tile)
        playersDb.set(playerId, { ...player, points })
      }

      for (const player of Object.values(this.state.players)) {
        const condition = gameOverCondition(
          tileDb,
          powerupsDb,
          playersDb,
          player.id,
        )

        if (condition) {
          this.state.game.endedAt = new Date().getTime()
          this.state.game.endCondition = condition
          return
        }
      }
    } finally {
      await this.saveState({
        selections: selectionsDb.byId,
        players: playersDb.byId,
        powerups: powerupsDb.byId,
        tiles: tileDb.byId,
        game: this.state.game,
      })
    }
  }

  async alarm() {
    if (!this.state.game.startedAt) {
      this.state.game.startedAt = new Date().getTime()

      await this.saveState({
        selections: this.state.selections,
        players: this.state.players,
        powerups: this.state.powerups,
        tiles: this.state.tiles,
        game: this.state.game,
      })
      return
    }

    await this.storage.deleteAll()
  }
}
