import { createMemo, createSignal, Match, Show, Switch } from "solid-js"
import { useParams } from "@solidjs/router"
import {
  GameStateProvider,
  playerColors,
  useGameState,
  createGameState,
  muted,
  setMuted,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { createOnlineMotor } from "@/state/motors/online"
import {
  playersClass,
  playerClass,
  playerIdClass,
  statsContainer,
  menuContainer,
} from "./duelGame.css"
import type { Player } from "@repo/game/player"
import { Avatar } from "@/components/avatar"
import { CursorArrows } from "@/components/game/cursorArrows"
import { getStandardDeck } from "@repo/game/deck"
import { GameOverDuel } from "./gameOverDuel"
import { Frame } from "@/components/game/frame"
import { Powerups } from "@/components/game/powerups"
import NumberFlow from "solid-number-flow"
import { Lobby } from "./duelLobby"
import { Button, LinkButton } from "@/components/button"
import { ArrowLeft, Bell, BellOff, Rotate } from "@/components/icon"
import { movesClass, statLabel, pointsClass } from "@/components/game/stats.css"
import { getAvailablePairs } from "@repo/game/game"
import { nanoid } from "nanoid"
import { makeTimer } from "@solid-primitives/timer"

export function Duel() {
  const params = useParams()

  const { state, started } = createGameState(() => params.id!, {
    deck: getStandardDeck(),
  })

  const { onSelectTile, onRestartGame, getWebSocket } = createOnlineMotor(
    state(),
    params.id!,
  )

  return (
    <GameStateProvider gameState={state()}>
      <Switch fallback={<Lobby />}>
        <Match when={state().game.get().endedAt}>
          <GameOverDuel onRestartGame={onRestartGame} />
        </Match>
        <Match when={started()}>
          <Frame
            board={<Board onSelectTile={onSelectTile} />}
            bottom={<Bottom />}
            top={<Top />}
          />
          <Show when={getWebSocket()}>
            {(ws) => <CursorArrows websocket={ws()} />}
          </Show>
        </Match>
      </Switch>
    </GameStateProvider>
  )
}

function Bottom() {
  const params = useParams()
  const gameState = useGameState()
  const [time, setTimer] = createSignal(0)
  const players = createMemo(() => gameState.players.all)

  const random = createMemo(() => {
    params.id // force a random id re-generation
    return nanoid()
  })

  makeTimer(
    () => {
      const now = new Date()
      const startedAt = gameState.game.get().startedAt
      if (!startedAt) return

      const diff = Math.floor((now.getTime() - startedAt) / 1000)

      setTimer(diff)
    },
    1000,
    setInterval,
  )

  return (
    <div class={statsContainer}>
      <div class={pointsClass}>
        <span class={statLabel}>Timer</span>
        <div>{time()}</div>
      </div>
      <nav class={menuContainer}>
        <LinkButton href="/" hue="bamboo">
          <ArrowLeft />
          back
        </LinkButton>
        <Show when={players().length === 1}>
          <LinkButton href={`/play/${random()}`} hue="character">
            <Rotate />
            restart
          </LinkButton>
        </Show>
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
      <div class={movesClass}>
        <span class={statLabel}>Moves</span>
        <div>{getAvailablePairs(gameState.tiles).length}</div>
      </div>
    </div>
  )
}

function Top() {
  const gameState = useGameState()

  const firstPlayer = createMemo(() => gameState.players.all[0]!)
  const secondPlayer = createMemo(() => gameState.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <PlayerComponent player={secondPlayer()} />
      </Show>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  const pColors = createMemo(() => playerColors(props.player))

  return (
    <div class={playerClass} style={{ color: pColors()[2] }}>
      <Avatar name={props.player.id} colors={pColors()} />
      <div class={playerIdClass}>
        {props.player.id} ( <NumberFlow value={props.player.points} /> )
      </div>
      <Powerups player={props.player} />
    </div>
  )
}
