import { createMemo, createSelector, createSignal, For } from "solid-js"
import { TileComponent } from "./tileComponent"
import { getCanvasHeight, getCanvasWidth } from "@/state/constants"
import { getFinder, mapGetLevels } from "@/lib/game"
import { createVoicesEffect } from "./createVoicesEffect"
import { useTileState } from "@/state/tileState"

type BoardProps = {
  onSelectTile: (tileId: string) => void
}
export function Board(props: BoardProps) {
  const [hover, setHover] = createSignal<string | null>(null)
  const isHovered = createSelector(hover)
  const tiles = useTileState()

  createVoicesEffect()

  const mapLevels = createMemo(() => mapGetLevels())

  const disclosedTile = createMemo(() => {
    const id = hover()
    if (!id) return
    const find = getFinder(tiles, tiles.get(id)!)

    for (let z = mapLevels() - 1; z >= 1; z--) {
      const leftTile =
        find(-2, -1, z) ||
        find(-2, 0, z) ||
        find(-2, 1, z) ||
        find(-1, -1, z) ||
        find(-1, 0, z) ||
        find(-1, 1, z)

      if (leftTile) {
        return leftTile.id
      }
    }
  })
  const isDisclosed = createSelector(disclosedTile)

  const hiddenImageId = createMemo(() => {
    const id = disclosedTile()
    if (!id) return
    const tile = tiles.get(id)!
    if (tile.material === "glass") return

    return getFinder(tiles, tile)(0, 0, -1)?.id
  })
  const isHiddenImage = createSelector(hiddenImageId)

  return (
    <div
      style={{
        position: "relative",
        width: `${getCanvasWidth()}px`,
        height: `${getCanvasHeight()}px`,
        margin: "0 auto",
      }}
    >
      <For each={tiles.all}>
        {(tile) => (
          <TileComponent
            tile={tile}
            hovered={isHovered(tile.id)}
            hideImage={isHiddenImage(tile.id)}
            enhanceVisibility={isDisclosed(tile.id)}
            onSelect={() => props.onSelectTile(tile.id)}
            onMouseEnter={() => setHover(tile.id)}
            onMouseLeave={() => setHover(null)}
          />
        )}
      </For>
    </div>
  )
}
