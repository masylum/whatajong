import type { Diff, State } from "@repo/game/types"
import { createStore, produce } from "solid-js/store"
import { batch, createSignal } from "solid-js"
import type { Session, WsMessage } from "@repo/game/types"
import { tileIndexes, type Tile, type TileIndexes } from "@repo/game/tile"
import { Database } from "./in-memoriam-signals"
import {
  selectionIndexes,
  type Selection,
  type SelectionIndexes,
} from "@repo/game/selection"
import { playerIndexes } from "@repo/game/player"
import type { Player, PlayerIndexes } from "@repo/game/player"

export const [loading, setLoading] = createSignal(true)
export const [sessions, setSessions] = createStore<Record<string, Session>>({})
export const [userId, setUserId] = createSignal<string>("")
export const [timer, setTimer] = createSignal<number>(0)
export const [hover, setHover] = createSignal<Tile | null>(null)

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
export const SIDE_SIZES = { xSide: -8, ySide: 8 }

export const db = {
  tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
  players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
  selections: new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  }),
}

function syncState(state: Diff) {
  batch(() => {
    for (const key in state) {
      const k = key as keyof State
      const updates = state[k]!
      for (const id in updates) {
        const entity = updates[id]
        if (entity) {
          db[k].set(id, updates[id] as any)
        } else {
          db[k].del(id)
        }
      }
    }
  })
}

export function onMessage(msg: WsMessage) {
  switch (msg.type) {
    case "sessions-quit":
      setSessions(
        produce((sessions) => {
          delete sessions[msg.id]
        }),
      )
      return
    case "sessions-join":
      setSessions(msg.id, msg.session)
      return
    case "sessions-sync":
      setSessions(
        Object.fromEntries(
          msg.sessions.map((session) => [session.id, session]),
        ),
      )
      return
    case "sessions-move":
      setSessions(
        msg.id,
        produce((session) => {
          session.x = msg.x
          session.y = msg.y
        }),
      )
      return
    case "sync":
      syncState(msg.diff)
      return
    case "init-state": {
      console.log(msg)
      syncState(msg.state)
      setTimer(msg.timer)
      setLoading(false)
      return
    }
    default:
      break
  }
}
