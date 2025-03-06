import {
  getRunPairs,
  type DeckTile,
  type DeckTileIndexes,
  deckTileIndexes,
  type Deck,
} from "@repo/game/deck"
import { Database } from "@repo/game/in-memoriam"
import { nanoid } from "nanoid"
import { on, useContext, type ParentProps } from "solid-js"
import { createContext, createEffect, createMemo } from "solid-js"

const DECK_STATE_NAMESPACE = "deck-state"

function key(runId: string) {
  return `${DECK_STATE_NAMESPACE}-${runId}`
}

export function createDeckState(runId: () => string) {
  const db = createMemo(
    () =>
      new Database<DeckTile, DeckTileIndexes>({
        indexes: deckTileIndexes,
      }),
  )

  createEffect(
    on(runId, (id) => {
      const persistedState = localStorage.getItem(key(id))
      if (persistedState) {
        db().update(JSON.parse(persistedState))
      } else {
        for (const tiles of getRunPairs()) {
          const id = nanoid()

          db().set(id, {
            id,
            card: tiles[0],
            material: "bone",
            count: tiles.length,
          })
        }
      }
    }),
  )

  createEffect(() => {
    localStorage.setItem(key(runId()), JSON.stringify(db().byId))
  })

  return db
}

const DeckStateContext = createContext<Deck | undefined>()

export function DeckStateProvider(props: { deck: Deck } & ParentProps) {
  return (
    <DeckStateContext.Provider value={props.deck}>
      {props.children}
    </DeckStateContext.Provider>
  )
}

export function useDeckState() {
  const context = useContext(DeckStateContext)

  if (!context) {
    throw new Error("can't find DeckStateContext")
  }

  return context
}
