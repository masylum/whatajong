import type { State } from "@repo/game/types"
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
import type { Powerup } from "@repo/game/powerups"
import { powerupIndexes } from "@repo/game/powerups"
import type { PowerupIndexes } from "@repo/game/powerups"
import { colorsByOrder } from "@/styles/colors"
import type { Game } from "@repo/game/game"
import Haikunator from "haikunator"
import { difference } from "@/lib/setMethods"
import { nouns } from "./names"
import { adjectives } from "./names"

export const [sessions, setSessions] = createStore<Record<string, Session>>({})
export const [game, setGame] = createSignal<Game | null>(null)
export const [muted, setMuted] = createSignal(false)

export function playerColors(playerId: string) {
  const player = db.players.get(playerId)!
  return colorsByOrder[player.order]!
}

export const db = {
  tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
  players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
  selections: new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  }),
  powerups: new Database<Powerup, PowerupIndexes>({
    indexes: powerupIndexes,
  }),
  game: game(),
} as const

let cachedUserId: string | undefined

export function userId() {
  if (cachedUserId) return cachedUserId

  const storedId = localStorage.getItem("userId")
  if (storedId) {
    cachedUserId = storedId
    return storedId
  }

  const userId = new Haikunator({ adjectives, nouns }).haikunate({
    tokenLength: 0,
    delimiter: " ",
  })
  cachedUserId = userId

  localStorage.setItem("userId", userId)
  return userId
}

export function setUserId(id: string) {
  cachedUserId = id
  localStorage.setItem("userId", id)
}

function syncState(state: State) {
  batch(() => {
    for (const key in state) {
      const k = key as keyof typeof db

      if (k === "game") {
        setGame(state.game)
        continue
      }

      const table = db[k]
      const updates = state[k]!
      const keysToDelete = difference(
        new Set(Object.keys(table.byId)),
        new Set(Object.keys(updates)),
      )

      for (const id of keysToDelete) {
        table.del(id)
      }

      for (const id in updates) {
        const entity = updates[id]
        table.set(id, entity as any)
      }
    }
  })
}

export function onMessage(msg: WsMessage) {
  if (msg.type !== "sessions-move") console.log("msg", msg)
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
      if (msg.id === userId()) return

      setSessions(
        msg.id,
        produce((session) => {
          session.x = msg.x
          session.y = msg.y
        }),
      )
      return
    case "sync":
      console.log(msg)
      syncState(msg.state)
      return
    default:
      break
  }
}
