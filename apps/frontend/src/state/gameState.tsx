import { createStore } from "solid-js/store"
import {
  batch,
  createContext,
  createSignal,
  useContext,
  type ParentProps,
} from "solid-js"
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
import { restartGame, type Game } from "@repo/game/game"
import Haikunator from "haikunator"
import { nouns } from "./names"
import { adjectives } from "./names"
import Rand from "rand-seed"
import type { Card } from "@repo/game/deck"
import type { MapName } from "@repo/game/map"

const STATE_NAMESPACE = "state"

// TODO: move to cursors?
export const [sessions, setSessions] = createStore<Record<string, Session>>({})

// TODO: move to board?
export const [muted, setMuted] = createSignal(false)

// TODO: move to player?
export function playerColors(playerId: string) {
  const player = gameState.players.get(playerId)!
  return colorsByOrder[player.order]!
}

export const gameState = {
  tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
  players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
  selections: new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  }),
  powerups: new Database<Powerup, PowerupIndexes>({
    indexes: powerupIndexes,
  }),
  game: new Value<Game>({ map: "default" }),
} as State

const GameStateContext = createContext<State | undefined>()

export function GameStateProvider(props: { gameState: State } & ParentProps) {
  return (
    <GameStateContext.Provider value={props.gameState}>
      {props.children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)

  if (!context) {
    throw new Error("can't find GameStateContext")
  }

  return context
}

function key(id: string) {
  return `${STATE_NAMESPACE}-${id}`
}

export function started(game: Game) {
  const time = game.startedAt
  if (!time) return false

  return time <= Date.now()
}

export function initGameState(
  id: string,
  {
    map,
    initialPoints,
    deck,
  }: { map: MapName; initialPoints: number; deck: [Card, Card][] },
) {
  const gameState = localStorage.getItem(key(id))

  const state = {
    tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
    players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }, [
      {
        id: userId(),
        points: 0,
        order: 0,
      },
    ]),
    selections: new Database<Selection, SelectionIndexes>({
      indexes: selectionIndexes,
    }),
    powerups: new Database<Powerup, PowerupIndexes>({
      indexes: powerupIndexes,
    }),
    game: new Value<Game>({ map: "default" }),
  } as State

  if (gameState) {
    syncState(state, JSON.parse(gameState))
  } else {
    const rng = new Rand(id)
    restartGame(state, rng, { map, initialPoints, deck })
  }

  return state
}

export function syncState(gameState: State, rawState: RawState) {
  batch(() => {
    for (const key in rawState) {
      const k = key as keyof typeof gameState

      if (k === "game") {
        gameState.game.set(rawState.game)
        continue
      }

      const table = gameState[k]
      const updates = rawState[k]!
      table.update(updates as any)
    }
  })
}

export function saveGameState(id: string) {
  try {
    localStorage.setItem(
      key(id),
      JSON.stringify({
        tiles: gameState.tiles.byId,
        players: gameState.players.byId,
        selections: gameState.selections.byId,
        powerups: gameState.powerups.byId,
        game: gameState.game.get(),
      }),
    )
  } catch (error) {
    console.error(error)
  }
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
