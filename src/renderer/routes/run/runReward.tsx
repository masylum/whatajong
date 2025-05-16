import { play, useMusic } from "@/components/audio"
import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { DustParticles } from "@/components/game/dustParticles"
import { Powerups } from "@/components/game/powerups"
import { ArrowRight, ArrowUp, Rotate } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type CardId,
  type Position,
  type Suit,
  type Tile,
  type TileIndexes,
  cardName,
  getCard,
  tileIndexes,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { shuffle } from "@/lib/rand"
import { useSmallerTileSize, useTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import {
  type Game,
  GameStateProvider,
  initialGameState,
  useGameState,
} from "@/state/gameState"
import { setMutable } from "@/state/persistantMutable"
import {
  type TileItem,
  buyTile,
  useLevels,
  useRunState,
} from "@/state/runState"
import { TileStateProvider, useTileState } from "@/state/tileState"
import { makeTimer } from "@solid-primitives/timer"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { uniqueBy } from "remeda"
import {
  For,
  Match,
  Show,
  Switch,
  batch,
  createMemo,
  createSelector,
  createSignal,
  onMount,
} from "solid-js"
import { createMutable } from "solid-js/store"
import { Board, Coins, Points, useComboEffect } from "./runGame"
import {
  buttonContainerClass,
  columnsClass,
  containerClass,
  contentClass,
  endConditionButtonClass,
  endConditionClass,
  endConditionTitleClass,
  explanationClass,
  floatingTileClass,
  pillsClass,
  sandboxClass,
  sandboxContentClass,
  subtitleClass,
  tilesContainerClass,
  tipClass,
  titleClass,
} from "./runReward.css"

const GAME_ID = "sandbox"

export default function RunReward() {
  const run = useRunState()
  const t = useTranslation()
  const levels = useLevels()
  const level = createMemo(() => levels().find((l) => l.level === run.round)!)
  const cards = createMemo(() =>
    level().tileItems.map((t) => getCard(t.cardId)),
  )
  const card = createMemo(() => cards()[0]!)
  const suit = createMemo(
    () => card().suit as Exclude<Suit, "bam" | "crack" | "dot">,
  )
  const rewardTitle = createMemo(() =>
    level().rewards === 1 ? cardName(t, card().id) : t.suit[suit()](),
  )
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
  const deck = useDeckState()

  function onContinue() {
    run.stage = "shop"

    for (const item of randTileItems()) {
      buyTile({ run, item, deck, reward: true })
    }
  }

  onMount(() => {
    play("reward")
  })
  useMusic("music")
  const tileDb = new Database<Tile, TileIndexes>(tileIndexes)
  const game = createMutable<Game>(initialGameState(GAME_ID))

  const [countdown, setCountdown] = createSignal(5)
  const dispose = makeTimer(
    () => {
      if (countdown() === 0) {
        dispose()
        return
      }
      setCountdown(countdown() - 1)
    },
    1000,
    setInterval,
  )

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
          <GameStateProvider game={game}>
            <TileStateProvider tileDb={tileDb}>
              <SandboxContent suit={suit()} />
            </TileStateProvider>
          </GameStateProvider>
        </div>
        <Show
          when={game.endCondition || countdown() === 0}
          fallback={
            <div class={buttonContainerClass}>
              <span class={tipClass({ countdown: countdown() as any })}>
                <ArrowUp />
                solve the puzzle
              </span>
            </div>
          }
        >
          <div class={buttonContainerClass}>
            <Button hue="dot" onPointerDown={onContinue}>
              {t.common.goToShop()}
              <ArrowRight />
            </Button>
          </div>
        </Show>
      </div>
    </div>
  )
}

function FloatingTile(props: {
  cardId: CardId
  i: number
  isSelected: boolean
}) {
  const tileSize = useSmallerTileSize(0.8)

  return (
    <div class={floatingTileClass({ isSelected: props.isSelected })}>
      <BasicTile cardId={props.cardId} width={tileSize().width} />
    </div>
  )
}

type PartialTile = Partial<Tile> & { cardId: CardId } & Position
function createTiles(tiles: PartialTile[]): Record<string, Tile> {
  const update: Record<string, Tile> = {}

  for (const tile of tiles) {
    const id = nanoid()
    update[id] = {
      id,
      deleted: false,
      material: "bone",
      points: 0,
      coins: 0,
      selected: false,
      ...tile,
    }
  }

  return update
}

const SANDBOXES = {
  wind: {
    tiles: [
      { cardId: "dot1", x: 0, y: 0, z: 0 },
      { cardId: "winde", x: 2, y: 0, z: 0 },
      { cardId: "winde", x: 0, y: 2, z: 0 },
      { cardId: "winde", x: 2, y: 2, z: 0 },
      { cardId: "windn", x: 4, y: 2, z: 0 },
      { cardId: "winde", x: 2, y: 0, z: 1 },
      { cardId: "dot1", x: 0, y: 2, z: 1 },
      { cardId: "windn", x: 2, y: 2, z: 1 },
    ],
    points: 20,
  },
  dragon: {
    tiles: [
      { cardId: "dot1", x: 0, y: 0, z: 0 },
      { cardId: "crack1", x: 2, y: 0, z: 0 },
      { cardId: "crack1", x: 4, y: 0, z: 0 },
      { cardId: "dragonr", x: 6, y: 0, z: 0 },
      { cardId: "crack2", x: 0, y: 2, z: 0 },
      { cardId: "crack2", x: 2, y: 2, z: 0 },
      { cardId: "dot1", x: 4, y: 2, z: 0 },
      { cardId: "bam3", x: 6, y: 2, z: 0 },
      { cardId: "crack7", x: 2, y: 0, z: 1 },
      { cardId: "crack7", x: 4, y: 0, z: 1 },
      { cardId: "bam3", x: 0, y: 2, z: 1 },
      { cardId: "dragonr", x: 2, y: 2, z: 1 },
    ],
    points: 26,
  },
  rabbit: {
    tiles: [
      { cardId: "dot1", x: 0, y: 0, z: 0 },
      { cardId: "rabbitg", x: 2, y: 0, z: 0 },
      { cardId: "winds", x: 4, y: 0, z: 0 },
      { cardId: "dot1", x: 6, y: 0, z: 0 },
      { cardId: "rabbitb", x: 0, y: 2, z: 0 },
      { cardId: "rabbitr", x: 2, y: 2, z: 0 },
      { cardId: "rabbitg", x: 4, y: 2, z: 0 },
      { cardId: "rabbitb", x: 6, y: 2, z: 0 },
      { cardId: "rabbitr", x: 2, y: 0, z: 1 },
      { cardId: "dot1", x: 6, y: 0, z: 1 },
      { cardId: "winds", x: 4, y: 2, z: 1 },
      { cardId: "dot1", x: 0, y: 2, z: 1 },
    ],
    points: 22,
  },
  sparrow: {
    tiles: [
      { cardId: "dot1", x: 0, y: 0, z: 0 },
      { cardId: "dot1", x: 2, y: 0, z: 0 },
      { cardId: "sparrowb", x: 4, y: 0, z: 0 },
      { cardId: "sparrowb", x: 6, y: 0, z: 0 },
      { cardId: "sparrowg", x: 0, y: 2, z: 0 },
      { cardId: "sparrowb", x: 2, y: 2, z: 0 },
      { cardId: "bam3", x: 4, y: 2, z: 0 },
      { cardId: "winds", x: 6, y: 2, z: 0 },
      { cardId: "sparrowg", x: 0, y: 0, z: 1 },
      { cardId: "sparrowb", x: 2, y: 0, z: 1 },
      { cardId: "bam3", x: 4, y: 0, z: 1 },
      { cardId: "winds", x: 6, y: 0, z: 1 },
      { cardId: "bam8", x: 2, y: 2, z: 1 },
      { cardId: "bam8", x: 4, y: 2, z: 1 },
    ],
    points: 24,
  },
  frog: {
    tiles: [
      { cardId: "bam1", x: 0, y: 0, z: 0 },
      { cardId: "dot7", x: 2, y: 0, z: 0 },
      { cardId: "dot7", x: 4, y: 0, z: 0 },
      { cardId: "crack2", x: 6, y: 0, z: 0 },
      { cardId: "frogr", x: 0, y: 2, z: 0 },
      { cardId: "frogg", x: 2, y: 2, z: 0 },
      { cardId: "bam1", x: 4, y: 2, z: 0 },
      { cardId: "crack2", x: 6, y: 2, z: 0 },
      { cardId: "winds", x: 0, y: 0, z: 1 },
      { cardId: "frogg", x: 2, y: 0, z: 1 },
      { cardId: "winds", x: 4, y: 0, z: 1 },
      { cardId: "frogr", x: 0, y: 2, z: 1 },
    ],
    points: 20,
  },
  lotus: {
    tiles: [
      { cardId: "crack1", x: 0, y: 0, z: 0 },
      { cardId: "dot1", x: 2, y: 0, z: 0 },
      { cardId: "bam1", x: 4, y: 0, z: 0 },
      { cardId: "crack1", x: 6, y: 0, z: 0 },
      { cardId: "windn", x: 0, y: 2, z: 0 },
      { cardId: "lotusg", x: 2, y: 2, z: 0 },
      { cardId: "lotusg", x: 6, y: 2, z: 0 },
      { cardId: "bam1", x: 0, y: 0, z: 1 },
      { cardId: "windn", x: 4, y: 0, z: 1 },
      { cardId: "dot1", x: 2, y: 2, z: 1 },
    ],
    points: 16,
  },
  shadow: {
    tiles: [
      { cardId: "shadowb", x: 0, y: 0, z: 0 },
      { cardId: "dot2", x: 2, y: 0, z: 0 },
      { cardId: "dot2", x: 4, y: 0, z: 0 },
      { cardId: "shadowb", x: 6, y: 0, z: 0 },
      { cardId: "lotusb", x: 0, y: 2, z: 0 },
      { cardId: "lotusb", x: 2, y: 2, z: 0 },
      { cardId: "dragonb", x: 4, y: 2, z: 0 },
      { cardId: "windn", x: 6, y: 2, z: 0 },
      { cardId: "windn", x: 4, y: 0, z: 1 },
      { cardId: "frogb", x: 6, y: 0, z: 1 },
      { cardId: "frogb", x: 4, y: 2, z: 1 },
      { cardId: "dragonb", x: 6, y: 2, z: 1 },
    ],
    points: 106,
  },
  taijitu: {
    tiles: [
      { cardId: "sparrowr", x: 0, y: 0, z: 0 },
      { cardId: "crack1", x: 2, y: 0, z: 0 },
      { cardId: "crack1", x: 4, y: 0, z: 0 },
      { cardId: "frogr", x: 6, y: 0, z: 0 },
      { cardId: "sparrowr", x: 0, y: 2, z: 0 },
      { cardId: "dot1", x: 2, y: 2, z: 0 },
      { cardId: "dot1", x: 4, y: 2, z: 0 },
      { cardId: "taijitur", x: 6, y: 2, z: 0 },
      { cardId: "frogr", x: 0, y: 0, z: 1 },
      { cardId: "taijitur", x: 2, y: 0, z: 1 },
      { cardId: "dragonr", x: 2, y: 2, z: 1 },
      { cardId: "dragonr", x: 4, y: 2, z: 1 },
    ],
    points: 228,
  },
  mutation: {
    tiles: [
      { cardId: "dot1", x: 0, y: 0, z: 0 },
      { cardId: "bam1", x: 2, y: 0, z: 0 },
      { cardId: "bam1", x: 4, y: 0, z: 0 },
      { cardId: "dot1", x: 6, y: 0, z: 0 },
      { cardId: "dragong", x: 0, y: 2, z: 0 },
      { cardId: "mutation3", x: 2, y: 2, z: 0 },
      { cardId: "lotusb", x: 6, y: 2, z: 0 },
      { cardId: "mutation3", x: 0, y: 0, z: 1 },
      { cardId: "dot2", x: 2, y: 0, z: 1 },
      { cardId: "lotusb", x: 4, y: 0, z: 1 },
      { cardId: "dragong", x: 6, y: 0, z: 1 },
      { cardId: "dot2", x: 0, y: 2, z: 1 },
    ],
    points: 40,
  },
  flower: {
    tiles: [
      { cardId: "flower1", x: 0, y: 0, z: 0 },
      { cardId: "dragonr", x: 2, y: 0, z: 0 },
      { cardId: "lotusr", x: 4, y: 0, z: 0 },
      { cardId: "lotusr", x: 6, y: 0, z: 0 },
      { cardId: "flower2", x: 0, y: 2, z: 0 },
      { cardId: "dragonr", x: 2, y: 2, z: 0 },
      { cardId: "lotusg", x: 4, y: 2, z: 0 },
      { cardId: "lotusg", x: 6, y: 2, z: 0 },
      { cardId: "flower1", x: 4, y: 0, z: 1 },
      { cardId: "flower2", x: 4, y: 2, z: 1 },
    ],
    points: 68,
  },
  phoenix: {
    tiles: [
      { cardId: "phoenix", x: 0, y: 0, z: 0 },
      { cardId: "bam5", x: 2, y: 0, z: 0 },
      { cardId: "dot4", x: 4, y: 0, z: 0 },
      { cardId: "bam5", x: 6, y: 0, z: 0 },
      { cardId: "crack2", x: 0, y: 2, z: 0 },
      { cardId: "bam3", x: 2, y: 2, z: 0 },
      { cardId: "lotusg", x: 4, y: 2, z: 0 },
      { cardId: "lotusg", x: 6, y: 2, z: 0 },
      { cardId: "phoenix", x: 2, y: 0, z: 1 },
      { cardId: "dot4", x: 4, y: 2, z: 1 },
      { cardId: "crack2", x: 4, y: 0, z: 1 },
      { cardId: "bam3", x: 6, y: 0, z: 1 },
    ],
    points: 108,
  },
  element: {
    tiles: [
      { cardId: "frogr", x: 0, y: 0, z: 0 },
      { cardId: "elementr", x: 2, y: 0, z: 0 },
      { cardId: "crack2", x: 4, y: 0, z: 0 },
      { cardId: "crack2", x: 6, y: 0, z: 0 },
      { cardId: "dragonr", x: 0, y: 2, z: 0 },
      { cardId: "crack7", x: 2, y: 2, z: 0 },
      { cardId: "crack7", x: 4, y: 2, z: 0 },
      { cardId: "crack1", x: 6, y: 2, z: 0 },
      { cardId: "windn", x: 2, y: 0, z: 1 },
      { cardId: "windn", x: 0, y: 0, z: 1 },
      { cardId: "frogr", x: 6, y: 0, z: 1 },
      { cardId: "dragonr", x: 2, y: 2, z: 1 },
      { cardId: "elementr", x: 4, y: 2, z: 1 },
      { cardId: "crack1", x: 6, y: 2, z: 1 },
    ],
    points: 182,
  },
  gem: {
    tiles: [
      { cardId: "bam2", x: 0, y: 0, z: 0 },
      { cardId: "dot1", x: 2, y: 0, z: 0 },
      { cardId: "gemg", x: 4, y: 0, z: 0 },
      { cardId: "gemg", x: 6, y: 0, z: 0 },
      { cardId: "dot1", x: 0, y: 2, z: 0 },
      { cardId: "flower1", x: 2, y: 2, z: 0, material: "jade" },
      { cardId: "flower1", x: 4, y: 2, z: 0, material: "jade" },
      { cardId: "dragong", x: 4, y: 0, z: 1 },
      { cardId: "dragong", x: 6, y: 0, z: 1 },
      { cardId: "gemb", x: 6, y: 2, z: 0 },
      { cardId: "bam2", x: 2, y: 2, z: 1 },
      { cardId: "gemb", x: 4, y: 2, z: 1 },
    ],
    points: 476,
  },
  joker: {
    tiles: [
      { cardId: "elementr", x: 0, y: 0, z: 0 },
      { cardId: "elementr", x: 2, y: 0, z: 0 },
      { cardId: "flower1", x: 0, y: 2, z: 0 },
      { cardId: "dragonr", x: 2, y: 2, z: 0 },
      { cardId: "flower1", x: 4, y: 2, z: 0 },
      { cardId: "elementr", x: 6, y: 2, z: 0 },
      { cardId: "elementr", x: 0, y: 0, z: 1 },
      { cardId: "dragonr", x: 2, y: 0, z: 1 },
      { cardId: "joker", x: 2, y: 2, z: 1 },
      { cardId: "joker", x: 4, y: 2, z: 1 },
    ],
    points: 276,
  },
} as Record<Suit, { tiles: PartialTile[]; points: number }>

function SandboxContent(props: { suit: Suit }) {
  const tileSize = useTileSize()
  const game = useGameState()
  const tileDb = useTileState()
  const sandbox = createMemo(() => SANDBOXES[props.suit])
  const t = useTranslation()
  const result = createMemo(() => {
    if (!game.endCondition) return null
    if (game.endCondition === "no-pairs") return "no-pairs"

    return sandbox().points === game.points ? "win" : "no-points"
  })

  function resetTiles() {
    tileDb.update(createTiles(sandbox().tiles))
  }

  onMount(resetTiles)

  function onRetry() {
    batch(() => {
      resetTiles()
      setMutable(game, initialGameState(GAME_ID))
    })
  }

  const comboAnimation = useComboEffect()

  return (
    <div class={sandboxClass({ comboAnimation: comboAnimation() as any })}>
      <div
        class={sandboxContentClass}
        style={{
          width: `${(tileSize().width + tileSize().sideSize) * 4}px`,
          height: `${(tileSize().height + tileSize().sideSize) * 2}px`,
        }}
      >
        <Board />
      </div>
      <Show when={result()}>
        {(result) => (
          <div
            class={endConditionClass({
              type: result() === "win" ? "win" : "lose",
            })}
          >
            <h3 class={endConditionTitleClass}>
              <Switch>
                <Match when={result() === "win"}>{t.runReward.win()}</Match>
                <Match when={result() === "no-pairs"}>
                  {t.runReward.noPairs()}
                </Match>
                <Match when={result() === "no-points"}>
                  {t.runReward.noPoints({
                    points: game.points,
                    objective: sandbox().points,
                  })}
                </Match>
              </Switch>
            </h3>
            <button
              type="button"
              class={endConditionButtonClass}
              onPointerDown={onRetry}
            >
              <Rotate />
              <Show when={result() === "win"} fallback="try again">
                {t.runReward.playAgain()}
              </Show>
            </button>
          </div>
        )}
      </Show>
      <div class={pillsClass}>
        <Points points={game.points} />
        <Show when={props.suit === "rabbit"}>
          <Coins coins={game.coins} />
        </Show>
      </div>
      <DustParticles />
      <Powerups />
    </div>
  )
}
