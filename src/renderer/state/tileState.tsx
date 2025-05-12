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
import { createPersistentDatabase } from "./persistentDatabase"

const TileStateContext = createContext<TileDb | undefined>()
const TILE_STATE_NAMESPACE = "tile-state"

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
  const db = new Database<Tile, TileIndexes>(tileIndexes)

  createPersistentDatabase({
    namespace: TILE_STATE_NAMESPACE,
    db,
    init: () => {
      initializeTileState(id, deck, db)
    },
  })

  return db
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
