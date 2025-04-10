import { useLayoutSize } from "@/state/constants"
import { useTileState } from "@/state/tileState"
import { For, createSelector, createSignal } from "solid-js"
import { createVoicesEffect } from "./createVoicesEffect"
import { TileComponent } from "./tileComponent"

type BoardProps = {
  onSelectTile: (tileId: string) => void
}
export function Board(props: BoardProps) {
  const [hover, setHover] = createSignal<string | null>(null)
  const isHovered = createSelector(hover)
  const tiles = useTileState()
  const layout = useLayoutSize()

  createVoicesEffect()

  return (
    <div
      style={{
        position: "relative",
        width: `${layout().width}px`,
        height: `${layout().height}px`,
        "z-index": 3,
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
