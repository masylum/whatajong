import { createMemo, Show } from "solid-js"
import {
  createGameState,
  GameStateProvider,
  muted,
  setMuted,
  started,
} from "@/state/gameState"
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
import { createPowerupState, PowerupStateProvider } from "@/state/powerupState"

export function Solo() {
  const params = useParams()
  const id = createMemo(() => `solo-${params.id}`)

  const tiles = createTileState({ id, deck: getStandardDeck() })
  const powerups = createPowerupState({ id })
  const state = createGameState({ id })

  return (
    <GameStateProvider game={state}>
      <TileStateProvider tileDb={tiles()}>
        <PowerupStateProvider powerupDb={powerups()}>
          <Show when={started(state)}>
            <Show
              when={state.endedAt}
              fallback={
                <Frame
                  board={
                    <Board
                      onSelectTile={(tileId) =>
                        selectTile({
                          tileDb: tiles(),
                          powerupsDb: powerups(),
                          game: state,
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
        </PowerupStateProvider>
      </TileStateProvider>
    </GameStateProvider>
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
  return (
    <div class={container}>
      <Points timerPoints={0.25} />
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
