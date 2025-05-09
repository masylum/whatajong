import { play, useMusic } from "@/components/audio"
import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { CardVideo } from "@/components/game/tileDetails"
import { ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type CardId, type Suit, getCard } from "@/lib/game"
import { shuffle } from "@/lib/rand"
import { useTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { useLevels, useRunState } from "@/state/runState"
import { type TileItem, buyTile, useShopState } from "@/state/shopState"
import Rand from "rand-seed"
import { uniqueBy } from "remeda"
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
  const levels = useLevels()
  const level = createMemo(() => levels().find((l) => l.level === run.round)!)
  const cards = createMemo(() =>
    level().tileItems.map((t) => getCard(t.cardId)),
  )
  const suit = createMemo(
    () => cards()[0]!.suit as Exclude<Suit, "bam" | "crack" | "dot">,
  )
  const rewardTitle = createMemo(() => t.suit[suit()]())
  const rewardExplanation = createMemo(() =>
    t.tileDetails.explanation[suit()](),
  )
  const shuffledTileItems = createMemo(() => {
    const rng = new Rand(`${run.runId}-${run.round}`)
    return shuffle(
      uniqueBy(level().tileItems, (t) => t.cardId),
      rng,
    )
  })
  const randTileItems = createMemo(() =>
    shuffledTileItems().slice(0, level().rewards),
  )
  const isSelected = createSelector<TileItem[], CardId>(
    randTileItems,
    (id, tileItems) => {
      const ids = new Set(tileItems.map((t) => t.cardId))
      return ids.has(id)
    },
  )
  const shop = useShopState()
  const deck = useDeckState()

  function onContinue() {
    run.stage = "shop"

    for (const item of randTileItems()) {
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
          <Show when={level().rewards === 1}>{t.runReward.subtitle()}</Show>
        </h1>
        <div class={columnsClass}>
          <h2 class={subtitleClass}>{rewardTitle()}</h2>
          <div class={tilesContainerClass}>
            <For each={shuffledTileItems()}>
              {(item, i) => (
                <FloatingTile
                  cardId={item.cardId}
                  i={i()}
                  isSelected={isSelected(item.cardId)}
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
