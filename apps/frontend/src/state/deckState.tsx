import {
  getRunPairs,
  type DeckTile,
  type DeckTileIndexes,
  deckTileIndexes,
  type Deck,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { nanoid } from "nanoid"
import { useContext, type ParentProps } from "solid-js"
import { createContext } from "solid-js"
import { persistentDatabase } from "./persistentDatabase"

type CreateDeckStateParams = { id: () => string }
export function createDeckState(params: CreateDeckStateParams) {
  return persistentDatabase({
    namespace: "deck-state",
    id: params.id,
    db: () =>
      new Database<DeckTile, DeckTileIndexes>({ indexes: deckTileIndexes }),
    init: (db) => {
      for (const tiles of getRunPairs()) {
        const id = nanoid()
        db.set(id, {
          id,
          card: tiles[0],
          material: "bone",
        })
      }
    },
  })
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
  if (!context) throw new Error("can't find DeckStateContext")

  return context
}
