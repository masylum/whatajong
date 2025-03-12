import { createMemo, createSelector, createSignal, For } from "solid-js"
import { TileComponent } from "./tileComponent"
import { useGameState, userId } from "@/state/gameState"
import { getCanvasHeight, getCanvasWidth } from "@/state/constants"
import { getFinder } from "@repo/game/tile"
import type { Selection } from "@repo/game/selection"
import { maps } from "@repo/game/map"
import { mapGetLevels } from "@repo/game/map"
import { createVoicesEffect } from "./createVoicesEffect"

type BoardProps = {
  onSelectTile: (selection: Selection) => void
}
export function Board(props: BoardProps) {
  const gameState = useGameState()
  const [hover, setHover] = createSignal<string | null>(null)
  const isHovered = createSelector(hover)

  createVoicesEffect()

  const map = createMemo(() => maps[gameState.game.get().map])
  const mapLevels = createMemo(() => mapGetLevels(map()))

  const disclosedTile = createMemo(() => {
    const id = hover()
    if (!id) return
    const find = getFinder(gameState.tiles, gameState.tiles.get(id)!)

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
    const tile = gameState.tiles.get(id)!
    if (tile.material === "glass") return

    return getFinder(gameState.tiles, tile)(0, 0, -1)?.id
  })
  const isHiddenImage = createSelector(hiddenImageId)

  function onSelect(tile: any) {
    const id = `${tile.id}-${userId()}`

    const selection = {
      id,
      tileId: tile.id,
      playerId: userId(),
    }

    props.onSelectTile(selection)
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${getCanvasWidth(map())}px`,
        height: `${getCanvasHeight(map())}px`,
        margin: "0 auto",
      }}
    >
      <For each={gameState.tiles.all}>
        {(tile) => (
          <TileComponent
            tile={tile}
            hovered={isHovered(tile.id)}
            hideImage={isHiddenImage(tile.id)}
            enhanceVisibility={isDisclosed(tile.id)}
            onSelect={onSelect}
            onMouseEnter={() => setHover(tile.id)}
            onMouseLeave={() => setHover(null)}
          />
        )}
      </For>
    </div>
  )
}
