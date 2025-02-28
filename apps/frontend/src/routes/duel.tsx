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
import { game, userId, playerColors, db } from "@/state/db"
import { Board } from "@/components/game/board"
import { GameOver } from "@/components/game/gameOver"
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
import { SOUNDS } from "@/components/game/audio"
import { play } from "@/components/game/audio"
import { CursorArrows } from "@/components/game/cursorArrows"
import { ArrowLeft, Copied, Copy } from "@/components/icon"
import { LinkButton } from "@/components/button"

export function Duel() {
  const params = useParams()

  const ws = createOnlineMotor({
    id: () => params.id!,
    modality: "duel",
  })
  const started = createMemo(() => {
    const time = game()?.startedAt
    if (!time) return false

    return time <= Date.now()
  })

  return (
    <Show when={ws()}>
      {(ws) => (
        <Show when={game()}>
          {(game) => (
            <Switch fallback={<Lobby />}>
              <Match when={game().endedAt}>
                <GameOver game={game()} ws={ws()} />
              </Match>
              <Match when={started()}>
                <Board ws={ws()} game={game()} />
                <CursorArrows websocket={ws()} />
              </Match>
            </Switch>
          )}
        </Show>
      )}
    </Show>
  )
}

function Lobby() {
  const [ready, setReady] = createSignal<number>(3)
  const player = createMemo(() => db.players.get(userId())!)
  const otherPlayer = createMemo(
    () => db.players.all.find((player) => player.id !== userId())!,
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
