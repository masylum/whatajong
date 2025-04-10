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
import { type ParentProps, createContext, useContext } from "solid-js"
import { persistentDatabase } from "./persistentDatabase"

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
