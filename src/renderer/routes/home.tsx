import {
  buttonAnimationDelayVar,
  buttonClass,
  buttonIconClass,
  cardAnimationDelayVar,
  cardClass,
  frameBottomClass,
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
import { play } from "@/components/audio"
import { fetchRuns } from "@/state/runState"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { useWindowSize } from "@solid-primitives/resize-observer"

function cards() {
  const rng = new Rand()
  return shuffle(getStandardPairs(), rng).flatMap(([c, _]) => c)
}

export function Home() {
  const runs = createMemo(() => fetchRuns())
  const db = useImageSrc("db")
  const dc = useImageSrc("dc")

  function onHover() {
    play("click2")
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
          style={{
            ...assignInlineVars({
              [buttonAnimationDelayVar]: "100ms",
            }),
          }}
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
          href={
            runs().length > 0 ? `/run/${runs()[0].runId}` : `/run/${nanoid()}`
          }
          class={buttonClass({ hue: "crack" })}
          style={{
            ...assignInlineVars({
              [buttonAnimationDelayVar]: "200ms",
            }),
          }}
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
  const size = useWindowSize()
  const padding = 0.95
  const horizontalTiles = createMemo(() =>
    Math.floor((size.width * padding) / tileSize().width),
  )
  const horizontalGap = createMemo(
    () => (size.width - horizontalTiles() * tileSize().width) / 2,
  )
  const verticalTiles = createMemo(() =>
    Math.floor((size.height * padding) / tileSize().height),
  )
  const verticalGap = createMemo(
    () => (size.height - verticalTiles() * tileSize().height) / 2,
  )

  return (
    <>
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
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${j() * 20}ms`,
                }),
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
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${horizontalTiles() * 20 + j() * 20}ms`,
                }),
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
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${j() * 20}ms`,
                }),
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
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${verticalTiles() * 20 + j() * 20}ms`,
                }),
                "z-index": horizontalTiles() + verticalTiles() + j(),
              }}
              card={card}
            />
          )}
        </For>
      </div>
    </>
  )
}
