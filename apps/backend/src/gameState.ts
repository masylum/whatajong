import { DurableObject } from "cloudflare:workers"
import { setup } from "@repo/game/setup"
import type { Env } from "./types"
import type { WsMessage, Session, Diff, State } from "@repo/game/types"
import type { Selection } from "@repo/game/selection"
import { deleteTile, initTileDb, isFree } from "@repo/game/tile"
import { cardsMatch } from "@repo/game/deck"

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

      this.timer = timer
      this.state = { tiles, players, selections }
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

    const colors = ["#2c73d2", "#ff9671"]
    if (numPlayers < 2) {
      this.state.players[id] = { id, color: colors[numPlayers]! }
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

  async setState(diff: Diff) {
    for (const key in diff) {
      const k = key as keyof State
      const table = this.state[k]
      const updates = diff[k]!

      for (const id in updates) {
        const state = updates[id]

        if (state) {
          table[id] = state
        } else {
          delete table[id]
        }
      }
      await this.storage.put(k, table)
    }

    this.broadcast({ type: "sync", diff })
  }

  selectTile(selection: Selection, session: Session) {
    const tilesDb = initTileDb(this.state.tiles)
    const tile = tilesDb.get(selection.tileId)
    // tiltMap(gameState)

    if (!tile) throw new Error("Tile not found")
    if (!isFree(tilesDb, tile)) {
      this.setState({ selections: { [selection.id]: null } })
      return
    }

    const firstSelection = Object.values(this.state.selections).find(
      (sel) => sel.playerId === session.id,
    )

    if (!firstSelection) {
      this.setState({
        selections: {
          [selection.id]: { ...selection, confirmed: true },
        },
      })
      return
    }

    if (firstSelection.id === selection.id) {
      this.setState({ selections: { [selection.id]: null } })
      return
    }

    const firstTile = tilesDb.get(firstSelection.tileId)
    if (!firstTile) {
      this.setState({ selections: { [selection.id]: null } })
      return
    }

    if (!cardsMatch(firstTile.card, tile.card)) {
      this.setState({
        selections: {
          [selection.id]: null,
          [firstSelection.id]: null,
        },
      })
      return
    }

    deleteTile(tilesDb, tile, session.id)
    deleteTile(tilesDb, firstTile, session.id)

    // TODO: check game over if no more available moves
    // TODO: check game over if strength is 0
    this.setState({
      selections: {
        [selection.id]: null,
        [firstSelection.id]: null,
      },
      tiles: tilesDb.byId,
    })

    return
  }
}
