import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowRight } from "@/components/icon"
import type { CardId } from "@/lib/game"
import { pick } from "@/lib/rand"
import { useSmallerTileSize } from "@/state/constants"
import { REWARDS, useRunState } from "@/state/runState"
import { For, createMemo } from "solid-js"
import {
  buttonContainerClass,
  columnsClass,
  containerClass,
  explanationClass,
  floatingTileClass,
  subtitleClass,
  tilesContainerClass,
  titleClass,
  videoClass,
} from "./runReward.css"

const TITLES = [
  "New tiles discovered",
  "Fresh tiles await",
  "Tiles revealed!",
  "Tiles granted",
  "Tiles received",
  "New tiles unlocked",
  "A gift for you",
  "A reward for you",
]
export default function RunReward() {
  const run = useRunState()
  const rewardKey = createMemo(() => REWARDS[run.round as keyof typeof REWARDS])
  const tileSize = useSmallerTileSize(0.8)

  const info = createMemo(() => {
    const key = rewardKey()
    if (!key) {
      throw Error("Expected reward not found")
    }

    // TODO: Add actual translations to i18n files for 'reward' keys
    switch (key) {
      case "winds":
        return {
          title: "Winds",
          explanation:
            "When cleared, a gust of wind moves the tiles towards the wind's direction.",
          tiles: ["ww", "we", "ws", "wn"],
          video: "winds.mp4",
        } as const
      case "dragons":
        return {
          title: "Dragons",
          explanation:
            "Clear dragon tiles to start a <strong>Dragon Run</strong>.<br />While the <strong>Dragon Run</strong> is active, clear tiles of the Dragon's color to score more points.",
          tiles: ["dr", "dg", "db", "dk"],
          video: "dragons.mp4",
        } as const
      case "rabbits":
        return {
          title: "Rabbits",
          explanation:
            "Rabbit tiles grant you one coin for each point they score.",
          tiles: ["rr", "rg", "rb", "rk"],
          video: "rabbits.mp4",
        } as const
      case "flowers":
        return {
          title: "Flowers",
          explanation:
            "Flower tiles are flexible: they contain all colors and can be matched with any other flower tile.",
          tiles: ["f1", "f2", "f3"],
          video: "flowers.mp4",
        } as const
      default:
        return {
          title: `Reward: ${key}`,
          explanation: "Explanation coming soon...",
          tiles: [] as CardId[],
          video: "dragons.mp4",
        } as const
    }
  })

  function onContinue() {
    run.stage = "shop"
  }

  return (
    <div class={containerClass}>
      <h1 class={titleClass}>{pick(TITLES)}</h1>
      <div class={columnsClass}>
        <h2 class={subtitleClass}>{info().title}</h2>
        <div class={tilesContainerClass}>
          <For each={info().tiles}>
            {(cardId, i) => (
              <div
                class={floatingTileClass}
                style={{ "animation-delay": `${i() * -0.5}s` }}
              >
                <BasicTile cardId={cardId} width={tileSize().width} />
              </div>
            )}
          </For>
        </div>
        <p class={explanationClass} innerHTML={info().explanation} />
        <video
          src={`/videos/${info().video}`}
          autoplay
          muted
          loop
          playsinline
          width="100%"
          class={videoClass}
        />
      </div>
      <div class={buttonContainerClass}>
        <Button hue="bam" kind="dark" onClick={onContinue}>
          Continue to Shop {/* Placeholder */}
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}
