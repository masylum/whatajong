import {
  buttonClass,
  cardClass,
  frameBottomClass,
  frameClass,
  frameLeftClass,
  frameRightClass,
  frameTopClass,
  homeClass,
  navClass,
  titleClass,
} from "./home.css"
import { BasicTile } from "@/components/game/basicTile"
import { getStandardPairs } from "@/lib/game"
import { shuffle } from "@/lib/rand"
import { For, createMemo } from "solid-js"
import { TILE_WIDTH, TILE_HEIGHT } from "@/state/constants"
import { nanoid } from "nanoid"
import { Mountains } from "@/components/mountains"
import Rand from "rand-seed"
import { play, SOUNDS } from "@/components/audio"
import { useGlobalState } from "@/state/globalState"
import { fetchRuns } from "@/state/runState"

function cards() {
  const rng = new Rand()
  return shuffle(getStandardPairs(), rng).flatMap(([c, _]) => c)
}

export function Home() {
  const globalState = useGlobalState()
  const runs = createMemo(() => fetchRuns())

  function onHover() {
    play(SOUNDS.CLICK2, globalState.muted)
  }

  return (
    <div class={homeClass}>
      <Frame />
      <h1 class={titleClass}>Whatajong</h1>
      <nav class={navClass}>
        <a
          onMouseEnter={onHover}
          href={`/play/${nanoid()}`}
          class={buttonClass({ hue: "bam" })}
        >
          <img src="/tiles/db.webp" alt="classic" width={36} height={52} />
          classic game
        </a>
        <a
          onMouseEnter={onHover}
          href={runs().length > 0 ? "/runs" : `/run/${nanoid()}`}
          class={buttonClass({ hue: "crack" })}
        >
          <img src="/tiles/dc.webp" alt="duel" width={36} height={52} />
          adventure game
        </a>
      </nav>
      <Mountains />
    </div>
  )
}

function Frame() {
  const horizontalTiles = createMemo(() => {
    return Math.floor(window.innerWidth / TILE_WIDTH)
  })
  const horizontalGap = createMemo(() => {
    return (window.innerWidth - horizontalTiles() * TILE_WIDTH) / 2
  })
  const verticalTiles = createMemo(() => {
    return Math.floor(window.innerHeight / TILE_HEIGHT)
  })
  const verticalGap = createMemo(() => {
    return (window.innerHeight - verticalTiles() * TILE_HEIGHT) / 2
  })

  return (
    <div class={frameClass}>
      <div
        class={frameTopClass}
        style={{
          "margin-inline": `${horizontalGap()}px`,
          "margin-block": `${verticalGap()}px`,
        }}
      >
        <For each={cards().slice(0, horizontalTiles())}>
          {(card, j) => (
            <BasicTile
              class={cardClass}
              style={{
                "z-index": horizontalTiles() + j(),
              }}
              card={card}
            />
          )}
        </For>
      </div>
      <div
        class={frameLeftClass}
        style={{
          "margin-inline": `${horizontalGap()}px`,
          "margin-block": `${verticalGap()}px`,
        }}
      >
        <For each={cards().slice(0, verticalTiles())}>
          {(card, j) => (
            <BasicTile
              class={cardClass}
              style={{
                "z-index": horizontalTiles() + j(),
                visibility:
                  j() === 0 || j() === verticalTiles() - 1
                    ? "hidden"
                    : "visible",
              }}
              card={card}
            />
          )}
        </For>
      </div>
      <div
        class={frameBottomClass}
        style={{
          "margin-inline": `${horizontalGap()}px`,
          "margin-block": `${verticalGap()}px`,
        }}
      >
        <For each={cards().slice(0, horizontalTiles())}>
          {(card, j) => (
            <BasicTile
              class={cardClass}
              style={{
                "z-index": horizontalTiles() * 10 + j(),
              }}
              card={card}
            />
          )}
        </For>
      </div>
      <div
        class={frameRightClass}
        style={{
          "margin-inline": `${horizontalGap()}px`,
          "margin-block": `${verticalGap()}px`,
        }}
      >
        <For each={cards().slice(0, verticalTiles())}>
          {(card, j) => (
            <BasicTile
              class={cardClass}
              style={{
                "z-index": horizontalTiles() * 10 + j(),
                visibility:
                  j() === 0 || j() === verticalTiles() - 1
                    ? "hidden"
                    : "visible",
              }}
              card={card}
            />
          )}
        </For>
      </div>
    </div>
  )
}
