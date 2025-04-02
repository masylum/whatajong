import { createMemo, onMount, Show } from "solid-js"
import { createGameState, GameStateProvider, started } from "@/state/gameState"
import { Board } from "@/components/game/board"
import { useParams } from "@solidjs/router"
import { getStandardDeck, selectTile } from "@/lib/game"
import { GameOverSolo } from "./gameOverSolo"
import { Frame } from "@/components/game/frame"
import { LinkButton } from "@/components/button"
import { Powerups } from "@/components/game/powerups"
import { PointsAndPenalty, Moves } from "@/components/game/stats"
import { Button } from "@/components/button"
import { Bell, BellOff, Rotate, Home } from "@/components/icon"
import { nanoid } from "nanoid"
import { menuContainer } from "./soloGame.css"
import { createTileState, TileStateProvider } from "@/state/tileState"
import { createRunState, RunStateProvider } from "@/state/runState"
import { useGlobalState } from "@/state/globalState"
import { captureRun } from "@/lib/observability"
import { GameTutorial } from "@/components/gameTutorial"

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
          <GameTutorial>
            <Show when={started(game)}>
              <Powerups />
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
                    bottomLeft={<BottomLeft />}
                    topLeft={<TopLeft />}
                    bottomRight={<BottomRight />}
                    topRight={<TopRight />}
                  />
                }
              >
                <GameOverSolo />
              </Show>
            </Show>
          </GameTutorial>
        </TileStateProvider>
      </GameStateProvider>
    </RunStateProvider>
  )
}

function TopLeft() {
  return (
    <LinkButton href="/" hue="bam">
      <Home />
    </LinkButton>
  )
}

function TopRight() {
  const globalState = useGlobalState()
  return (
    <nav class={menuContainer}>
      <LinkButton href={`/play/${nanoid()}`} hue="crack">
        <Rotate />
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
  )
}

function BottomLeft() {
  return <PointsAndPenalty timerPoints={0.25} />
}

function BottomRight() {
  return <Moves />
}
