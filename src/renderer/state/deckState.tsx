import {
  type Deck,
  type DeckTile,
  type DeckTileIndexes,
  deckTileIndexes,
  getInitialPairs,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { type ParentProps, batch, useContext } from "solid-js"
import { createContext } from "solid-js"
import { persistentDatabase } from "./persistentDatabase"

const DECK_STATE_NAMESPACE = "deck-state-v3"

export function createDeckState() {
  return persistentDatabase({
    namespace: DECK_STATE_NAMESPACE,
    db: () => new Database<DeckTile, DeckTileIndexes>(deckTileIndexes),
    init: (db) => {
      initializeDeckState(db)
    },
  })
}

export function initializeDeckState(deck: Deck) {
  batch(() => {
    deck.update({})
    const pairs = getInitialPairs()
    for (const [i, cards] of pairs.entries()) {
      const id = i.toString()
      deck.set(id, {
        id,
        cardId: cards[0].id,
        material: "bone",
      })
    }
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
