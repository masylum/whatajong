import { DurableObject } from "cloudflare:workers"
import type { Env } from "./types"
import type { WsMessage, Session, State } from "@repo/game/types"
import { initSelectionsDb, type Selection } from "@repo/game/selection"
import { initPlayersDb } from "@repo/game/player"
import { restartGame, selectTile } from "@repo/game/game"
import Rand from "rand-seed"
import { Value } from "@repo/game/in-memoriam"
import { initPowerupsDb } from "@repo/game/powerups"
import { initTileDb } from "@repo/game/tile"

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
      const state = await this.storage.get("state")

      if (state) {
        this.state = state as State
      } else {
        this.state = {
          tiles: initTileDb({}),
          selections: initSelectionsDb({}),
          powerups: initPowerupsDb({}),
          players: initPlayersDb({}),
          game: new Value({}),
        }
        restartGame(this.state, new Rand())
        await this.storage.put("state", this.serializeState())
      }

      this.storage.setAlarm(Date.now() + GAME_TIMEOUT)
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
          restartGame(this.state, new Rand())
          await this.saveState()
          break
        }

        case "select-tile": {
          await this.selectTile(parsedMsg.selection)
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

    try {
      const playerIds = new Set(
        Object.values(this.state.players).map((player) => player.id),
      )

      if (playerIds.size === 0) {
        this.state.players.set(id, { id, points: 0, order: 0 })
      } else if (!playerIds.has(id) && playerIds.size === 1) {
        this.state.players.set(id, { id, points: 0, order: 1 })
        this.storage.setAlarm(Date.now() + GAME_COUNTDOWN)
      }

      return new Response(null, {
        status: 101,
        webSocket: client,
      })
    } finally {
      await this.saveState()
    }
  }

  serializeState() {
    return {
      tiles: this.state.tiles.byId,
      selections: this.state.selections.byId,
      players: this.state.players.byId,
      powerups: this.state.powerups.byId,
      game: this.state.game.get(),
    }
  }

  async saveState() {
    const state = this.serializeState()
    this.storage.put("state", state)
    this.broadcast({ type: "sync", state })
  }

  async selectTile(selection: Selection) {
    try {
      selectTile(this.state, selection)
    } catch (error) {
      console.error(error)
    } finally {
      await this.saveState()
    }
  }

  async alarm() {
    if (!this.state.game.get().startedAt) {
      this.state.game.set({ startedAt: new Date().getTime() })
      await this.saveState()
      return
    }
  }
}
