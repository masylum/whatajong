import { play, useMusic } from "@/components/audio"
import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { CardVideo } from "@/components/game/tileDetails"
import { ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type CardId, type Suit, getAllTiles, getCard } from "@/lib/game"
import { seedPick } from "@/lib/rand"
import { useTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { useRunState } from "@/state/runState"
import { buyTile, generateTileItem, useShopState } from "@/state/shopState"
import Rand from "rand-seed"
import { For, Show, createMemo, createSelector, onMount } from "solid-js"
import {
  buttonContainerClass,
  columnsClass,
  containerClass,
  contentClass,
  explanationClass,
  floatingTileClass,
  subtitleClass,
  tilesContainerClass,
  titleClass,
  videoClass,
} from "./runReward.css"

export default function RunReward() {
  const run = useRunState()
  const t = useTranslation()
  const rewards = createMemo(() =>
    getAllTiles().filter((t) => t.level === run.round),
  )
  const suit = createMemo(
    () => rewards()[0]!.suit as Exclude<Suit, "bam" | "crack" | "dot">,
  )
  const rewardTitle = createMemo(() => t.suit[suit()]())
  const rewardExplanation = createMemo(() =>
    t.tileDetails.explanation[suit()](),
  )
  const rewardAmount = createMemo(() => (suit() === "wind" ? "all" : "one"))
  const randTile = createMemo(() => {
    const rng = new Rand(`${run.runId}-${run.round}`)
    return seedPick(rewards(), rng)!.id
  })
  const isSelected = createSelector(randTile)
  const shop = useShopState()
  const deck = useDeckState()

  function onContinue() {
    run.stage = "shop"

    const cardIds =
      rewardAmount() === "all" ? rewards().map((t) => t.id) : [randTile()]

    for (const cardId of cardIds) {
      const item = generateTileItem({ card: getCard(cardId), i: 0 })
      buyTile({ run, shop, item, deck, reward: true })
    }
  }

  onMount(() => {
    play("reward")
  })
  useMusic("shop")

  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <h1 class={titleClass}>
          {t.runReward.title()}{" "}
          <Show when={rewardAmount() === "one"}>{t.runReward.subtitle()}</Show>
        </h1>
        <div class={columnsClass}>
          <h2 class={subtitleClass}>{rewardTitle()}</h2>
          <div class={tilesContainerClass}>
            <For each={rewards()}>
              {(card, i) => (
                <FloatingTile
                  cardId={card.id}
                  i={i()}
                  isSelected={rewardAmount() === "all" || isSelected(card.id)}
                />
              )}
            </For>
          </div>
          <p class={explanationClass} innerHTML={rewardExplanation()} />
          <CardVideo suit={suit()} class={videoClass} />
        </div>
        <div class={buttonContainerClass}>
          <Button hue="dot" onPointerDown={onContinue}>
            {t.common.goToShop()}
            <ArrowRight />
          </Button>
        </div>
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
