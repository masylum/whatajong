import { play, useMusic } from "@/components/audio"
import { Mountains } from "@/components/background"
import { BasicTile } from "@/components/game/basicTile"
import { useTranslation } from "@/i18n/useTranslation"
import {
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  jokers,
  rabbits,
  winds,
} from "@/lib/game"
import { shuffle } from "@/lib/rand"
import { useImageSrc, useSmallerTileSize } from "@/state/constants"
import { useWindowSize } from "@solid-primitives/resize-observer"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import Rand from "rand-seed"
import { For, createMemo } from "solid-js"
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

function cards() {
  const rng = new Rand()
  const basicTiles = [
    ...bams,
    ...cracks,
    ...dots,
    ...dragons,
    ...rabbits,
    ...jokers,
    ...winds,
    ...flowers,
  ]
  return shuffle([...basicTiles, ...basicTiles], rng)
}

export function Home() {
  const t = useTranslation()
  const img = useImageSrc()

  function onHover() {
    play("click2")
  }

  useMusic("music")

  return (
    <div class={homeClass}>
      <Frame />
      <h1 class={titleClass}>Whatajong</h1>
      <nav class={navClass}>
        <a
          onMouseEnter={onHover}
          href="/play"
          class={buttonClass({ hue: "crack" })}
          style={{
            ...assignInlineVars({
              [buttonAnimationDelayVar]: "200ms",
            }),
          }}
        >
          <img
            class={buttonIconClass}
            src={`${img()}/dragonr.webp`}
            alt="duel"
            width={36}
            height={52}
          />
          {t.common.play()}
        </a>
        <a
          onMouseEnter={onHover}
          href="/help"
          class={buttonClass({ hue: "dot" })}
          style={{
            ...assignInlineVars({
              [buttonAnimationDelayVar]: "400ms",
            }),
          }}
        >
          <img
            class={buttonIconClass}
            src={`${img()}/dragonb.webp`}
            alt="help"
            width={36}
            height={52}
          />
          {t.common.help()}
        </a>
        <a
          onMouseEnter={onHover}
          href="/settings"
          class={buttonClass({ hue: "bam" })}
          style={{
            ...assignInlineVars({
              [buttonAnimationDelayVar]: "600ms",
            }),
          }}
        >
          <img
            class={buttonIconClass}
            src={`${img()}/dragong.webp`}
            alt="classic"
            width={36}
            height={52}
          />
          {t.settings.title()}
        </a>
      </nav>
      <Mountains num={0} />
    </div>
  )
}

const MAX_WIDTH = 2000
const MAX_HEIGHT = 1600

function Frame() {
  const size = useWindowSize()
  const tileSize = useSmallerTileSize(
    Math.min(1, Math.max(0.7, size.width / MAX_WIDTH)),
  )
  const padding = 0.95
  const screenWidth = createMemo(() => Math.min(size.width, MAX_WIDTH))
  const screenHeight = createMemo(() => Math.min(size.height, MAX_HEIGHT))
  const horizontalTiles = createMemo(() =>
    Math.floor((screenWidth() * padding) / tileSize().width),
  )
  const horizontalGap = createMemo(
    () => (size.width - horizontalTiles() * tileSize().width) / 2,
  )
  const verticalTiles = createMemo(() =>
    Math.floor((screenHeight() * padding) / tileSize().height),
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
            <div
              class={cardClass}
              style={{
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${j() * 20}ms`,
                }),
                "z-index": j(),
              }}
            >
              <BasicTile width={tileSize().width} cardId={card.id} />
            </div>
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
            <div
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
            >
              <BasicTile width={tileSize().width} cardId={card.id} />
            </div>
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
            <div
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
            >
              <BasicTile width={tileSize().width} cardId={card.id} />
            </div>
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
            <div
              class={cardClass}
              style={{
                ...assignInlineVars({
                  [cardAnimationDelayVar]: `${verticalTiles() * 20 + j() * 20}ms`,
                }),
                "z-index": horizontalTiles() + verticalTiles() + j(),
              }}
            >
              <BasicTile width={tileSize().width} cardId={card.id} />
            </div>
          )}
        </For>
      </div>
    </>
  )
}
