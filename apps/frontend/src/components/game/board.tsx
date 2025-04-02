import { createSelector, createSignal, For } from "solid-js"
import { TileComponent } from "./tileComponent"
import { createVoicesEffect } from "./createVoicesEffect"
import { useTileState } from "@/state/tileState"
import { useLayoutSize } from "@/state/constants"

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
