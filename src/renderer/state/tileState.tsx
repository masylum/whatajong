import {
  type DeckTile,
  type Tile,
  type TileDb,
  type TileIndexes,
  tileIndexes,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { setupTiles } from "@/lib/setupTiles"
import Rand from "rand-seed"
import { type ParentProps, batch, createContext, useContext } from "solid-js"
import { persistentDatabase } from "./persistentDatabase"

const TileStateContext = createContext<TileDb | undefined>()
export const TILE_STATE_NAMESPACE = "tile-state"

export function TileStateProvider(props: { tileDb: TileDb } & ParentProps) {
  return (
    <TileStateContext.Provider value={props.tileDb}>
      {props.children}
    </TileStateContext.Provider>
  )
}

export function useTileState() {
  const context = useContext(TileStateContext)
  if (!context) throw new Error("can't find TileStateContext")

  return context
}

export function createTileState({
  id,
  deck,
}: { id: string; deck: DeckTile[] }) {
  return persistentDatabase({
    namespace: TILE_STATE_NAMESPACE,
    db: () => new Database<Tile, TileIndexes>(tileIndexes),
    init: (db) => {
      console.log("init tile state", id, JSON.stringify(deck))
      initializeTileState(id, deck, db)
    },
  })
}

export function initializeTileState(
  id: string,
  deck: DeckTile[],
  db: Database<Tile, TileIndexes>,
) {
  const rng = new Rand(id)
  const newTiles = setupTiles({ rng, deck })

  batch(() => {
    db.update({})
    for (const tile of Object.values(newTiles)) {
      db.set(tile.id, tile)
    }
  })
}
