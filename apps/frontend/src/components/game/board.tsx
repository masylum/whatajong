import { createSelector, createSignal, For } from "solid-js"
import { TileComponent } from "./tileComponent"
import { getCanvasHeight, getCanvasWidth } from "@/state/constants"
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
            onSelect={() => props.onSelectTile(tile.id)}
            onMouseEnter={() => setHover(tile.id)}
            onMouseLeave={() => setHover(null)}
          />
        )}
      </For>
    </div>
  )
}
