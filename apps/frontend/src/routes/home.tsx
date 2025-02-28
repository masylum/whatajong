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
import { BasicTile } from "@/components/game/basicTile"
import { getDeck } from "@repo/game/deck"
import { For, createMemo } from "solid-js"
import { TILE_WIDTH, TILE_HEIGHT } from "@/state/constants"
import { nanoid } from "nanoid"
import { SOUNDS } from "@/components/game/audio"
import { play } from "@/components/game/audio"
import { Mountains } from "@/components/mountains"

function cards() {
  return getDeck().flatMap(([c, _]) => c)
}

export function Home() {
  function onHover() {
    play(SOUNDS.CLICK)
  }

  return (
    <div class={homeClass}>
      <Frame />
      <h1 class={titleClass}>Whatajong</h1>
      <nav class={navClass}>
        <a
          onMouseEnter={onHover}
          href={`/play/${nanoid()}`}
          class={buttonClass({ hue: "bamboo" })}
        >
          <img src="/tiles/b.webp" alt="classic" width={24} height={24} />
          classic game
        </a>
        <a
          onMouseEnter={onHover}
          href={`/duel/${nanoid()}`}
          class={buttonClass({ hue: "character" })}
        >
          <img src="/tiles/c.webp" alt="duel" width={24} height={24} />
          multiplayer
        </a>
        <a
          onMouseEnter={onHover}
          href="/instructions"
          class={buttonClass({ hue: "circle" })}
        >
          <img src="/tiles/o.webp" alt="instructions" width={24} height={24} />
          instructions
        </a>
      </nav>
      <Mountains />
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
