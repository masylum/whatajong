import { createMemo, onMount, Show } from "solid-js"
import { createGameState, GameStateProvider, started } from "@/state/gameState"
import { Board } from "@/components/game/board"
import { useParams } from "@solidjs/router"
import { getStandardDeck, selectTile } from "@/lib/game"
import { GameOverSolo } from "./gameOverSolo"
import { Frame } from "@/components/game/frame"
import { LinkButton } from "@/components/button"
import { Powerups } from "@/components/game/powerups"
import { Points, Moves } from "@/components/game/stats"
import { Button } from "@/components/button"
import { ArrowLeft, Bell, BellOff, Rotate } from "@/components/icon"
import { nanoid } from "nanoid"
import { menuContainer, container } from "./soloGame.css"
import { createTileState, TileStateProvider } from "@/state/tileState"
import { createRunState, RunStateProvider } from "@/state/runState"
import { useGlobalState } from "@/state/globalState"
import { captureRun } from "@/lib/observability"

export function Solo() {
  const params = useParams()
  const id = createMemo(() => `solo-${params.id}`)

  const run = createRunState({ id })
  const tiles = createTileState({ id, deck: getStandardDeck() })
  const game = createGameState({ id })

  onMount(() => {
    captureRun(id(), "solo")
  })

  return (
    <RunStateProvider run={run}>
      <GameStateProvider game={game}>
        <TileStateProvider tileDb={tiles()}>
          <Show when={started(game)}>
            <Show
              when={game.endedAt}
              fallback={
                <Frame
                  board={
                    <Board
                      onSelectTile={(tileId) =>
                        selectTile({
                          tileDb: tiles(),
                          run,
                          game,
                          tileId,
                        })
                      }
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
        </TileStateProvider>
      </GameStateProvider>
    </RunStateProvider>
  )
}

export function Top() {
  return (
    <div class={container}>
      <Powerups />
    </div>
  )
}

export function Bottom() {
  const globalState = useGlobalState()

  return (
    <div class={container}>
      <Points timerPoints={0.25} />
      <nav class={menuContainer}>
        <LinkButton href="/" hue="bam">
          <ArrowLeft />
          back
        </LinkButton>
        <LinkButton href={`/play/${nanoid()}`} hue="crack">
          <Rotate />
          restart
        </LinkButton>
        <Button
          type="button"
          hue="dot"
          title="silence"
          onClick={() => {
            globalState.muted = !globalState.muted
          }}
        >
          <Show when={globalState.muted} fallback={<Bell />}>
            <BellOff />
          </Show>
        </Button>
      </nav>
      <Moves />
    </div>
  )
}
