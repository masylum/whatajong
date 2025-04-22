import type { CardId, Material } from "@/lib/game"
import { Show, mergeProps } from "solid-js"
import { miniTileClass } from "./miniTile.css"

export function MiniTile(props: {
  cardId?: CardId
  material?: Material
  size?: number
}) {
  const mProps = mergeProps({ size: 24, material: "bone" } as const, props)

  return (
    <div class={miniTileClass({ material: mProps.material })}>
      <Show when={props.cardId}>
        {(cardId) => (
          <img
            src={`/tiles/xs/${cardId()}.webp`}
            alt={cardId()}
            height={mProps.size}
          />
        )}
      </Show>
    </div>
  )
}
