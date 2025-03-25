import {
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  phoenix,
  rabbits,
  seasons,
  winds,
  type Suit,
} from "@/lib/game"
import { createMemo, For } from "solid-js"
import { MiniTile } from "./miniTile"

export function MiniTiles(props: { suit: Suit }) {
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
    }
  })

  return (
    <span>
      <For each={cards()}>{(card) => <MiniTile card={card} />}</For>
    </span>
  )
}
