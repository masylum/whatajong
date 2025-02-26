import { DustParticles } from "@/components/game/dustParticles"
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
import { mountainsClass } from "@/components/game/board.css"
import { BasicTile } from "@/components/game/basicTile"
import { getDeck } from "@repo/game/deck"
import { For, createMemo } from "solid-js"
import { TILE_WIDTH, TILE_HEIGHT } from "@/state/constants"
import { nanoid } from "nanoid"

function cards() {
  return getDeck().flatMap(([c, _]) => c)
}

export function Home() {
  return (
    <div class={homeClass}>
      <Frame />
      <h1 class={titleClass}>Mahjong arena</h1>
      <nav class={navClass}>
        <a href={`/play/${nanoid()}`} class={buttonClass({ hue: "bamboo" })}>
          classic
        </a>
        <a href={`/duel/${nanoid()}`} class={buttonClass({ hue: "character" })}>
          duel
        </a>
        <a href="/instructions" class={buttonClass({ hue: "circle" })}>
          instructions
        </a>
      </nav>
      <div class={mountainsClass} />
      <DustParticles />
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
                "z-index": horizontalTiles() - j(),
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
                "z-index": horizontalTiles() * 10 - j(),
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
    </div>
  )
}
