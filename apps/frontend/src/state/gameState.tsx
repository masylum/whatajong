import { createStore } from "solid-js/store"
import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
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
import type { MapName } from "@repo/game/map"
import type { DeckTile } from "@repo/game/deck"

const STATE_NAMESPACE = "state"

// TODO: move to cursors?
export const [sessions, setSessions] = createStore<Record<string, Session>>({})

// TODO: move to board?
export const [muted, setMuted] = createSignal(false)

// TODO: move elsewhere?
export function playerColors(player: Player) {
  return colorsByOrder[player.order]!
}

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

export function createGameState(
  id: () => string,
  {
    map,
    initialPoints,
    deck,
  }: { map: MapName; initialPoints: number; deck: DeckTile[] },
) {
  const state = createMemo<State>(() => ({
    tiles: new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
    players: new Database<Player, PlayerIndexes>({ indexes: playerIndexes }),
    selections: new Database<Selection, SelectionIndexes>({
      indexes: selectionIndexes,
    }),
    powerups: new Database<Powerup, PowerupIndexes>({
      indexes: powerupIndexes,
    }),
    game: new Value<Game>({ map: "default" }),
  }))

  createEffect(
    on(id, (id) => {
      const persistedState = localStorage.getItem(key(id))
      if (persistedState) {
        syncState(state(), JSON.parse(persistedState))
      } else {
        const rng = new Rand(id)
        state().players.set(userId(), {
          id: userId(),
          points: initialPoints,
          order: 0,
        })
        restartGame({
          db: state(),
          rng,
          mapName: map,
          initialPoints,
          deck,
        })
      }
    }),
  )

  const started = createMemo(() => {
    const time = state().game.get().startedAt
    if (!time) return false

    return time <= Date.now()
  })

  createEffect(() => {
    try {
      localStorage.setItem(
        key(id()),
        JSON.stringify({
          tiles: state().tiles.byId,
          players: state().players.byId,
          selections: state().selections.byId,
          powerups: state().powerups.byId,
          game: state().game.get(),
        }),
      )
    } catch (error) {
      console.error(error)
    }
  })

  return { state, started }
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

// TODO: move elsewhere? Is this game state?
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

// TODO: move elsewhere?
export function calculateSeconds(gameState: State) {
  return Math.floor(
    (gameState.game.get().endedAt! - gameState.game.get().startedAt!) / 1000,
  )
}
