import { createMemo, For, Show } from "solid-js"
import { MiniTiles } from "@/components/miniTiles"
import { MiniTile } from "@/components/miniTile"
import type { Card, Suit } from "@/lib/game"

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
