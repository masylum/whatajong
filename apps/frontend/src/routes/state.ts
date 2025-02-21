import type { State } from "@repo/game/types"
import { createStore, produce } from "solid-js/store"
import { batch, createMemo, createSignal } from "solid-js"
import type { Session, WsMessage } from "@repo/game/types"
import {
  getFinder,
  tileIndexes,
  type Tile,
  type TileIndexes,
} from "@repo/game/tile"
import { Database } from "./in-memoriam-signals"
import {
  selectionIndexes,
  type Selection,
  type SelectionIndexes,
} from "@repo/game/selection"
import { playerIndexes } from "@repo/game/player"
import type { Player, PlayerIndexes } from "@repo/game/player"
import { MAP_HEIGHT, MAP_LEVELS, MAP_WIDTH } from "@repo/game/map"
import type { Powerup } from "@repo/game/powerups"
import { powerupIndexes } from "@repo/game/powerups"
import type { PowerupIndexes } from "@repo/game/powerups"
import { colorsByOrder } from "@/components/colors"

export const [loading, setLoading] = createSignal(true)
export const [sessions, setSessions] = createStore<Record<string, Session>>({})
export const [userId, setUserId] = createSignal<string>("")
export const [timer, setTimer] = createSignal<number>(0)
export const [hover, setHover] = createSignal<Tile | null>(null)
export const [points, setPoints] = createSignal<number>(0)

export const TILE_HEIGHT = 65
export const TILE_WIDTH = 45
export const INNER_PADING = 2
export const CORNER_RADIUS = 4
export const SIDE_SIZES = { xSide: -8, ySide: 8 }
export const CANVAS_WIDTH = (MAP_WIDTH / 2) * TILE_WIDTH + 4 * SIDE_SIZES.xSide
export const CANVAS_HEIGHT =
  (MAP_HEIGHT / 2) * TILE_HEIGHT + 4 * SIDE_SIZES.ySide

export const disclosedTile = createMemo(() => {
  const tile = hover()
  if (!tile) return
  const find = getFinder(db.tiles, tile)

  for (let z = MAP_LEVELS - 1; z >= 1; z--) {
    const leftTile = find(-2, -1, z) || find(-2, 0, z) || find(-2, 1, z)
    if (leftTile) {
      return leftTile
    }
  }
})

export function playerColors(playerId: string) {
  const player = db.players.get(playerId)!
  return colorsByOrder[player.order]!
}

export const hiddenImage = createMemo(() => {
  const tile = disclosedTile()
  if (!tile) return
  return getFinder(db.tiles, tile)(0, 0, -1)
})

export const db = {
  tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
  players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
  selections: new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  }),
  powerups: new Database<Powerup, PowerupIndexes>({
    indexes: powerupIndexes,
  }),
  points: points(),
} as const

function syncState(state: State) {
  batch(() => {
    for (const key in state) {
      const k = key as keyof typeof db

      if (k === "points") {
        setPoints(state.points)
        return
      }

      const table = db[k]
      const updates = state[k]!
      const keysToDelete = new Set(Object.keys(table.byId)).difference(
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
      console.log(msg)
      syncState(msg.state)
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
