import { createContext, useContext, type ParentProps } from "solid-js"
import {
  tileIndexes,
  type Tile,
  type TileDb,
  type TileIndexes,
  type DeckTile,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { persistentDatabase } from "./persistentDatabase"
import { setupTiles } from "@/lib/setupTiles"
import Rand from "rand-seed"

const TileStateContext = createContext<TileDb | undefined>()

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
}: { id: () => string; deck: DeckTile[] }) {
  return persistentDatabase({
    namespace: "tile-state",
    id,
    db: () => new Database<Tile, TileIndexes>({ indexes: tileIndexes }),
    init: (db) => {
      const rng = new Rand(id())
      const newTiles = setupTiles({ rng, deck })
      for (const tile of Object.values(newTiles)) {
        db.set(tile.id, tile)
      }
    },
  })
}
