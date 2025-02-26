import {
  createMemo,
  createSignal,
  Match,
  Show,
  Switch,
  For,
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

export function Duel() {
  const params = useParams()

  const ws = createOnlineMotor({
    id: () => params.id!,
    modality: "duel",
  })
  const started = createMemo(() => {
    const time = game()?.started_at
    if (!time) return false

    return time <= Date.now()
  })

  return (
    <Show when={ws()}>
      {(ws) => (
        <Show when={game()}>
          {(game) => (
            <Switch fallback={<Lobby />}>
              <Match when={game().ended_at}>
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
  const [copyTimestamp, setCopyTimestamp] = createSignal(Date.now())

  function onClickCopy() {
    writeClipboard(url())
    setCopied(true)
    setCopyTimestamp(Date.now())
    setTimeout(() => setCopied(false), 3_000)
  }

  createEffect((prevPlayers: Player[] | null) => {
    const pl = players()

    if (ready() === 3 && !prevPlayers && pl) {
      play(SOUNDS["321"])
      const interval = setInterval(() => {
        if (ready() === 1) {
          clearInterval(interval)
        }
        setReady(ready() - 1)
      }, 1_000)
    }

    return pl
  }, players())

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
                <Show
                  when={copied()}
                  fallback={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class={copyIconClass}
                    >
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v4" />
                      <path d="M21 14H11" />
                      <path d="m15 10-4 4 4 4" />
                    </svg>
                  }
                >
                  <div class={copiedIconContainerClass}>
                    <For each={[copyTimestamp()]}>
                      {() => <div class={copySuccessCircleClass} />}
                    </For>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class={copiedIconClass}
                    >
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
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
