import {
  type Suit,
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  phoenixes,
  rabbits,
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
      case "p":
        return phoenixes
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
            {(card) => <MiniTile cardId={card.id} size={20} />}
          </For>
        }
      >
        <MiniTile cardId={cards()[0]!.id} size={20} />
        →
        <MiniTile cardId={cards()[8]!.id} size={20} />
      </Show>
    </span>
  )
}
