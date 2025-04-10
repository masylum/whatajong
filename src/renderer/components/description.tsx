import { MiniTile } from "@/components/miniTile"
import { MiniTiles } from "@/components/miniTiles"
import type { Card, Suit } from "@/lib/game"
import { For, Show, createMemo } from "solid-js"

export function Description(props: { str: string }) {
  const parts = createMemo(() => props.str.split(/(::.{1,2}::)/))

  return (
    <For each={parts()}>
      {(part) => (
        <Show when={part.match(/::(.)(.)?::/)} fallback={part}>
          {(match) => (
            <>
              <Show
                when={match()[2]}
                fallback={<MiniTiles suit={match()[1] as Suit} />}
              >
                {(number) => (
                  <MiniTile card={`${match()[1]}${number()}` as Card} />
                )}
              </Show>
            </>
          )}
        </Show>
      )}
    </For>
  )
}
