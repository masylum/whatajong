import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { CardVideo } from "@/components/game/tileDetails"
import { ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type CardId, type Suit, getCard } from "@/lib/game"
import { seedPick } from "@/lib/rand"
import { useTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { REWARDS, useRunState } from "@/state/runState"
import { buyTile, generateTileItem, useShopState } from "@/state/shopState"
import Rand from "rand-seed"
import { For, Show, createMemo, createSelector } from "solid-js"
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

export default function RunReward() {
  const run = useRunState()
  const reward = createMemo(() => REWARDS[run.round as keyof typeof REWARDS]!)
  const info = createMemo(() => fetchReward(reward()))
  const t = useTranslation()
  const randTile = createMemo(() => {
    const rng = new Rand(`${run.runId}-${run.round}`)
    return seedPick(info().tiles, rng)!
  })
  const isSelected = createSelector(randTile)
  const shop = useShopState()
  const deck = useDeckState()

  function onContinue() {
    run.stage = "shop"

    const tiles = info().reward === "all" ? info().tiles : [randTile()]

    for (const tile of tiles) {
      const item = generateTileItem({ card: getCard(tile), i: 0 })
      buyTile({ run, shop, item, deck, reward: true })
    }
  }

  return (
    <div class={containerClass}>
      <h1 class={titleClass}>
        {t.runReward.title()}{" "}
        <Show when={info().reward === "one"}>{t.runReward.subtitle()}</Show>
      </h1>
      <div class={columnsClass}>
        <h2 class={subtitleClass}>{info().title}</h2>
        <div class={tilesContainerClass}>
          <For each={info().tiles}>
            {(cardId, i) => (
              <FloatingTile
                cardId={cardId}
                i={i()}
                isSelected={info().reward === "all" || isSelected(cardId)}
              />
            )}
          </For>
        </div>
        <p class={explanationClass} innerHTML={info().explanation} />
        <CardVideo suit={reward()} class={videoClass} />
      </div>
      <div class={buttonContainerClass}>
        <Button hue="bam" kind="dark" onClick={onContinue}>
          {t.common.goToShop()}
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

function FloatingTile(props: {
  cardId: CardId
  i: number
  isSelected: boolean
}) {
  const tileSize = useTileSize()

  return (
    <div class={floatingTileClass({ isSelected: props.isSelected })}>
      <BasicTile cardId={props.cardId} width={tileSize().width} />
    </div>
  )
}

function fetchReward(reward: Suit) {
  const t = useTranslation()

  switch (reward) {
    case "w":
      return {
        title: t.suit.w(),
        explanation: t.tileDetails.explanation.wind(),
        tiles: ["ww", "we", "ws", "wn"],
        reward: "all",
      } as const
    case "d":
      return {
        title: t.suit.d(),
        explanation: t.tileDetails.explanation.dragon(),
        tiles: ["dr", "dg", "db", "dk"],
        reward: "one",
      } as const
    case "r":
      return {
        title: t.suit.r(),
        explanation: t.tileDetails.explanation.rabbit(),
        tiles: ["rr", "rg", "rb"],
        reward: "one",
      } as const
    case "f":
      return {
        title: t.suit.f(),
        explanation: t.tileDetails.explanation.flower(),
        tiles: ["f1", "f2", "f3"],
        reward: "one",
      } as const
    case "p":
      return {
        title: t.suit.p(),
        explanation: t.tileDetails.explanation.phoenix(),
        tiles: ["pr", "pg", "pb"],
        reward: "one",
      } as const
    case "m":
      return {
        title: t.suit.m(),
        explanation: t.tileDetails.explanation.mutation(),
        tiles: ["m1", "m2", "m3", "m4", "m5"],
        reward: "one",
      } as const
    case "j":
      return {
        title: t.suit.j(),
        explanation: t.tileDetails.explanation.joker(),
        tiles: ["j1"],
        reward: "one",
      } as const
    case "e":
      return {
        title: t.suit.e(),
        explanation: t.tileDetails.explanation.element(),
        tiles: ["er", "eg", "eb", "ek"],
        reward: "one",
      } as const
    case "t":
      return {
        title: t.suit.t(),
        explanation: t.tileDetails.explanation.trigram(),
        tiles: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"],
        reward: "one",
      } as const
    case "g":
      return {
        title: t.suit.g(),
        explanation: t.tileDetails.explanation.gem(),
        tiles: ["gr", "gg", "gb", "gk"],
        reward: "one",
      } as const
    default:
      return {
        title: `Reward: ${reward}`,
        explanation: "Explanation coming soon...",
        tiles: [] as CardId[],
        reward: 1,
      } as const
  }
}
