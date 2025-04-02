import {
  buttonClass,
  buttonIconClass,
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
import { useImageSrc, useTileSize } from "@/state/constants"
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
  const db = useImageSrc("db")
  const dc = useImageSrc("dc")

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
          <img
            class={buttonIconClass}
            src={db()}
            alt="classic"
            width={36}
            height={52}
          />
          classic game
        </a>
        <a
          onMouseEnter={onHover}
          href={runs().length > 0 ? `/run/${runs()[0].id}` : `/run/${nanoid()}`}
          class={buttonClass({ hue: "crack" })}
        >
          <img
            class={buttonIconClass}
            src={dc()}
            alt="duel"
            width={36}
            height={52}
          />
          adventure game
        </a>
      </nav>
      <Mountains />
    </div>
  )
}

function Frame() {
  const tileSize = useTileSize()
  const horizontalTiles = createMemo(() => {
    return Math.floor(window.innerWidth / tileSize().width)
  })
  const horizontalGap = createMemo(() => {
    return (window.innerWidth - horizontalTiles() * tileSize().width) / 2
  })
  const verticalTiles = createMemo(() => {
    return Math.floor(window.innerHeight / tileSize().height)
  })
  const verticalGap = createMemo(() => {
    return (window.innerHeight - verticalTiles() * tileSize().height) / 2
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
                "z-index": j(),
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
                "z-index": horizontalTiles() + verticalTiles() + j(),
              }}
              card={card}
            />
          )}
        </For>
      </div>
    </div>
  )
}
