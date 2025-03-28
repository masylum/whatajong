import { miniTileClass } from "./miniTile.css"
import type { Card, Suit, Material } from "@/lib/game"
import { Show, mergeProps } from "solid-js"

export function MiniTile(props: {
  card?: Card | Suit
  material?: Material
  size?: 20 | 24 | 48
}) {
  const mProps = mergeProps({ size: 24, material: "bone" } as const, props)

  return (
    <div class={miniTileClass({ material: mProps.material })}>
      <Show when={props.card}>
        {(card) => (
          <img
            src={`/tiles/${card()}.webp`}
            alt={card()}
            height={mProps.size}
          />
        )}
      </Show>
    </div>
  )
}
