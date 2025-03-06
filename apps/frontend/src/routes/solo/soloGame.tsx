import { createMemo, Show } from "solid-js"
import {
  createGameState,
  GameStateProvider,
  muted,
  setMuted,
  useGameState,
  userId,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { useParams } from "@solidjs/router"
import { getStandardDeck } from "@repo/game/deck"
import { selectTile } from "@repo/game/game"
import { GameOverSolo } from "./gameOverSolo"
import { Frame } from "@/components/game/frame"
import { LinkButton } from "@/components/button"
import { Powerups } from "@/components/game/powerups"
import { Points, Moves } from "@/components/game/stats"
import { Button } from "@/components/button"
import { ArrowLeft, Bell, BellOff, Rotate } from "@/components/icon"
import { nanoid } from "nanoid"
import { menuContainer, container } from "./soloGame.css"

export function Solo() {
  const params = useParams()

  const { state, started } = createGameState(() => params.id!, {
    map: "default",
    initialPoints: 150,
    deck: getStandardDeck(),
  })

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
          <GameOverSolo />
        </Show>
      </Show>
    </GameStateProvider>
  )
}

export function Top() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)

  return (
    <div class={container}>
      <Powerups player={player()} />
    </div>
  )
}

export function Bottom() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)

  return (
    <div class={container}>
      <Points player={player()} />
      <nav class={menuContainer}>
        <LinkButton href="/" hue="bamboo">
          <ArrowLeft />
          back
        </LinkButton>
        <LinkButton href={`/play/${nanoid()}`} hue="character">
          <Rotate />
          restart
        </LinkButton>
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
