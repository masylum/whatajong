import { createMemo, Show, type ParentProps } from "solid-js"
import {
  GameStateProvider,
  createGameState,
  muted,
  setMuted,
  useGameState,
  userId,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverRun } from "./gameOverRun"
import { useRound, useRunState } from "@/state/runState"
import {
  getCardPoints,
  getMaterialPoints,
  getRawPoints,
  getRawMultiplier,
  selectTile,
  getMaterialMultiplier,
} from "@repo/game/game"
import { Frame } from "@/components/game/frame"
import { BasicTile } from "@/components/game/basicTile"
import { HoverCard } from "@kobalte/core/hover-card"
import {
  containerClass,
  menuContainerClass,
  pointsContainerClass,
  pointsClass,
  pointsListClass,
  pointsListItemClass,
  pointsListItemPointsClass,
  pointsListItemTitleClass,
  xClass,
  pointsContentClass,
} from "./runGame.css"
import { Powerups } from "@/components/game/powerups"
import { Bell } from "@/components/icon"
import { Button } from "@/components/button"
import { Moves, Points } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"
import { suitName } from "@repo/game/tile"
import { getDragonMultiplier } from "@repo/game/powerups"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()

  const { state, started } = createGameState(
    () => `game-${run.get().runId}-${round().id}`,
    { deck: deck.all },
  )

  return (
    <GameStateProvider gameState={state()}>
      <Show when={started()}>
        <Show
          when={state().game.get().endedAt}
          fallback={
            <Frame
              board={
                <Board
                  onSelectTile={(selection) => selectTile(state(), selection)}
                />
              }
              bottom={<Bottom />}
              top={<Top />}
            />
          }
        >
          <GameOverRun />
        </Show>
      </Show>
    </GameStateProvider>
  )
}

function Top() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)
  const tile = createMemo(() => {
    const sel = gameState.selections.findBy({ playerId: userId() })
    if (!sel) return null
    return gameState.tiles.get(sel.tileId)
  })

  return (
    <div class={containerClass}>
      <Powerups player={player()} />
      <Show when={tile()}>
        {(tile) => (
          <div class={pointsContainerClass}>
            <BasicTile card={tile().card} material={tile().material} />
            <Counter kind="points" count={getRawPoints(tile())}>
              <CounterItem
                name={tile().material}
                points={getMaterialPoints(tile().material)}
              />
              <CounterItem
                name={suitName(tile().card)}
                points={getCardPoints(tile().card)}
              />
            </Counter>
            <div class={xClass}>x</div>
            <Counter
              kind="multiplier"
              count={getRawMultiplier(gameState.powerups, userId(), tile())}
            >
              <CounterItem name="base" points={1} />
              <Show when={getMaterialMultiplier(tile().material)}>
                {(multiplier) => (
                  <CounterItem name={tile().material} points={multiplier()} />
                )}
              </Show>
              <Show
                when={getDragonMultiplier(gameState.powerups, userId(), tile())}
              >
                {(multiplier) => (
                  <CounterItem name="dragon run" points={multiplier()} />
                )}
              </Show>
            </Counter>
          </div>
        )}
      </Show>
    </div>
  )
}

function Bottom() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)

  return (
    <div class={containerClass}>
      <Points player={player()} />
      <nav class={menuContainerClass}>
        <Button
          type="button"
          hue="circle"
          title="silence"
          onClick={() => setMuted(!muted())}
        >
          <Show when={muted()} fallback={<Bell />}>
            <BellOff />
          </Show>
        </Button>
      </nav>
      <Moves />
    </div>
  )
}

function Counter(
  props: { count: number; kind: "points" | "multiplier" } & ParentProps,
) {
  return (
    <HoverCard gutter={8} openDelay={100} closeDelay={100}>
      <HoverCard.Trigger class={pointsClass({ kind: props.kind })}>
        {props.count}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content class={pointsContentClass({ kind: props.kind })}>
          <ul class={pointsListClass}>{props.children}</ul>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard>
  )
}

function CounterItem(props: { name: string; points: number }) {
  return (
    <li class={pointsListItemClass}>
      <h3 class={pointsListItemTitleClass}>{props.name}</h3>
      <p class={pointsListItemPointsClass}>+{props.points}</p>
    </li>
  )
}
