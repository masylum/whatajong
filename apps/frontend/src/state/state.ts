import { createStore } from "solid-js/store"
import { batch, createSignal } from "solid-js"
import type { State, Session, RawState } from "@repo/game/types"
import { tileIndexes, type Tile, type TileIndexes } from "@repo/game/tile"
import { Database, Value } from "@repo/game/in-memoriam"
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
import { nouns } from "./names"
import { adjectives } from "./names"

const STATE_NAMESPACE = "state"
export const [sessions, setSessions] = createStore<Record<string, Session>>({})
export const [muted, setMuted] = createSignal(false)

export function playerColors(playerId: string) {
  const player = state.players.get(playerId)!
  return colorsByOrder[player.order]!
}

export const state = {
  tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
  players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
  selections: new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  }),
  powerups: new Database<Powerup, PowerupIndexes>({
    indexes: powerupIndexes,
  }),
  game: new Value<Game>({}),
} as State

export function writeState(id: string) {
  try {
    localStorage.setItem(
      key(id),
      JSON.stringify({
        tiles: state.tiles.byId,
        players: state.players.byId,
        selections: state.selections.byId,
        powerups: state.powerups.byId,
        game: state.game.get(),
      }),
    )
  } catch (error) {
    console.error(error)
  }
}

function key(id: string) {
  return `${STATE_NAMESPACE}-${id}`
}

export function syncState(rawState: RawState) {
  batch(() => {
    for (const key in rawState) {
      const k = key as keyof typeof state

      if (k === "game") {
        state.game.set(rawState.game)
        continue
      }

      const table = state[k]
      const updates = rawState[k]!
      table.update(updates as any)
    }
  })
}

export function readState(id: string) {
  try {
    const state = localStorage.getItem(key(id))
    if (state) {
      return JSON.parse(state)
    }
  } catch (error) {
    console.error(error)
  }
}

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
