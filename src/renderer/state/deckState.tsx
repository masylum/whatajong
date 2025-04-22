import {
  type Deck,
  type DeckTile,
  type DeckTileIndexes,
  deckTileIndexes,
  getInitialPairs,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { nanoid } from "nanoid"
import { type ParentProps, useContext } from "solid-js"
import { createContext } from "solid-js"
import { persistentDatabase } from "./persistentDatabase"

type CreateDeckStateParams = { id: () => string }
export function createDeckState(params: CreateDeckStateParams) {
  return persistentDatabase({
    namespace: "deck-state",
    id: params.id,
    db: () => new Database<DeckTile, DeckTileIndexes>(deckTileIndexes),
    init: (db) => {
      for (const cards of getInitialPairs()) {
        const id = nanoid()
        db.set(id, {
          id,
          cardId: cards[0].id,
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
