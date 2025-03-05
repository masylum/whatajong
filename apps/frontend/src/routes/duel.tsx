import {
  createMemo,
  createSignal,
  Match,
  Show,
  Switch,
  createEffect,
} from "solid-js"
import { writeClipboard } from "@solid-primitives/clipboard"
import { useLocation, useParams } from "@solidjs/router"
import {
  GameStateProvider,
  userId,
  playerColors,
  initGameState,
  saveGameState,
  started,
  useGameState,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverMultiPlayer } from "@/components/game/gameOver"
import { createOnlineMotor } from "@/state/motors/online"
import {
  lobbyClass,
  titleClass,
  vsClass,
  playersClass,
  playerClass,
  buttonClass,
  instructionClass,
  urlClass,
  instructionTitleClass,
  copyIconClass,
  copiedIconClass,
  copySuccessCircleClass,
  copiedIconContainerClass,
} from "./duel.css"
import type { Player } from "@repo/game/player"
import { Avatar } from "@/components/avatar"
import { play, SOUNDS } from "@/components/audio"
import { CursorArrows } from "@/components/game/cursorArrows"
import { ArrowLeft, Copied, Copy } from "@/components/icon"
import { LinkButton } from "@/components/button"
import { getStandardPairs } from "@repo/game/deck"

export function Duel() {
  const params = useParams()

  const gameState = createMemo(() =>
    initGameState(params.id!, {
      map: "default",
      initialPoints: 150,
      deck: getStandardPairs(),
    }),
  )

  const { onSelectTile, onRestartGame, getWebSocket } = createOnlineMotor(
    gameState(),
    params.id!,
  )

  createEffect(() => {
    saveGameState(params.id!)
  })

  return (
    <GameStateProvider gameState={gameState()}>
      <Switch fallback={<Lobby />}>
        <Match when={gameState().game.get().endedAt}>
          <GameOverMultiPlayer onRestartGame={onRestartGame} />
        </Match>
        <Match when={started(gameState().game.get())}>
          <Board onSelectTile={onSelectTile} />
          <Show when={getWebSocket()}>
            {(ws) => <CursorArrows websocket={ws()} />}
          </Show>
        </Match>
      </Switch>
    </GameStateProvider>
  )
}

function Lobby() {
  const gameState = useGameState()
  const [ready, setReady] = createSignal<number>(3)
  const player = createMemo(() => gameState.players.get(userId())!)
  const otherPlayer = createMemo(
    () => gameState.players.all.find((player) => player.id !== userId())!,
  )
  const location = useLocation()

  const players = createMemo(() => {
    if (!player()) return null
    if (!otherPlayer()) return null

    return [player(), otherPlayer()]
  })

  const url = createMemo(() => {
    const origin = window.location.origin
    return `${origin}${location.pathname}${location.search}${location.hash}`
  })
  const [copied, setCopied] = createSignal(false)

  function onClickCopy() {
    writeClipboard(url())
    setCopied(true)
    setTimeout(() => setCopied(false), 3_000)
  }

  createEffect(() => {
    if (ready() === 3 && players()?.length === 2) {
      play(SOUNDS["321"])
      const interval = setInterval(() => {
        if (ready() === 1) {
          clearInterval(interval)
        }
        setReady(ready() - 1)
      }, 1_000)
    }
  })

  return (
    <div class={lobbyClass}>
      <h1 class={titleClass}>
        <Show when={players()} fallback="duel">
          {ready()}
        </Show>
      </h1>
      <Show
        when={players()}
        fallback={
          <div class={instructionClass}>
            <h2 class={instructionTitleClass}>
              share this link with a friend to play against them:
            </h2>
            <pre class={urlClass}>
              {url()}
              <button type="button" onClick={onClickCopy} class={buttonClass}>
                <Show when={copied()} fallback={<Copy class={copyIconClass} />}>
                  <div class={copiedIconContainerClass}>
                    <div class={copySuccessCircleClass} />
                    <Copied class={copiedIconClass} />
                  </div>
                </Show>
              </button>
            </pre>
          </div>
        }
      >
        {(players) => (
          <div class={playersClass}>
            <PlayerComponent player={players()[0]!} />
            <div class={vsClass}>vs</div>
            <PlayerComponent player={players()[1]!} />
          </div>
        )}
      </Show>
      <LinkButton href="/" hue="bamboo" kind="dark">
        <ArrowLeft />
        back
      </LinkButton>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  return (
    <div
      class={playerClass}
      style={{
        background: `linear-gradient(
          to bottom,
          rgba(from ${playerColors(props.player.id)[1]} r g b / 0.8),
          rgba(from ${playerColors(props.player.id)[1]} r g b / 0.1)
        )`,
        color: playerColors(props.player.id)[5],
      }}
    >
      <Avatar name={props.player.id} colors={playerColors(props.player.id)} />
      {props.player.id}
    </div>
  )
}
