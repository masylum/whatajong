import {
  type Suit,
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  phoenix,
  rabbits,
  seasons,
  winds,
} from "@/lib/game"
import { For, Show, createMemo } from "solid-js"
import { MiniTile } from "./miniTile"

export function MiniTiles(props: { suit: Suit }) {
  const showRange = createMemo(
    () => props.suit === "b" || props.suit === "c" || props.suit === "o",
  )
  const cards = createMemo(() => {
    switch (props.suit) {
      case "b":
        return bams
      case "c":
        return cracks
      case "o":
        return dots
      case "d":
        return dragons
      case "f":
        return flowers
      case "s":
        return seasons
      case "p":
        return phoenix
      case "r":
        return rabbits
      case "w":
        return winds
      default:
        throw new Error(`Unknown suit: ${props.suit}`)
    }
  })

  return (
    <span>
      <Show
        when={showRange()}
        fallback={
          <For each={cards()}>
            {(card) => <MiniTile card={card} size={20} />}
          </For>
        }
      >
        <MiniTile card={cards()[0]} size={20} />
        →
        <MiniTile card={cards()[8]} size={20} />
      </Show>
    </span>
  )
}
