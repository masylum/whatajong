import { createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js"
import { useParams } from "@solidjs/router"
import type { WsMessage } from "@repo/game/types"
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  game,
  onMessage,
  setSessions,
  setUserId,
  userId,
} from "./state"
import { Board } from "../components/game/board"
import { GameOver } from "../components/game/gameOver"
const INTERVAL = 55

export function Game() {
  const params = useParams()

  const [ws, setWs] = createSignal<WebSocket | null>(null)

  function startWebSocket() {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${wsProtocol}://localhost:8787/ws/${params.id}?id=${userId()}`,
    )
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "get-cursors" }))
    }
    ws.onmessage = (message) => {
      onMessage(JSON.parse(message.data))
    }
    ws.onclose = () => setSessions({})

    return ws
  }

  const [abortController] = createSignal(new AbortController())
  const [lastSentTimestamp, setLastSentTimestamp] = createSignal(0)

  onMount(() => {
    setUserId(params.userId!)
    setWs(startWebSocket())

    document.addEventListener(
      "mousemove",
      (ev) => {
        const x = ev.pageX / CANVAS_WIDTH
        const y = ev.pageY / CANVAS_HEIGHT
        const now = Date.now()

        if (
          now - lastSentTimestamp() > INTERVAL &&
          ws()?.readyState === WebSocket.OPEN
        ) {
          const message = {
            type: "sessions-move",
            id: userId(),
            x,
            y,
          } as WsMessage
          ws()?.send(JSON.stringify(message))
          setLastSentTimestamp(now)
        }
      },
      {
        signal: abortController().signal,
      },
    )
  })

  onCleanup(() => {
    ws()?.close()
    abortController().abort()
  })

  return (
    <Show when={ws()}>
      {(ws) => (
        <Show when={game()}>
          {(game) => (
            <Switch fallback={"TODO"}>
              <Match when={game().ended_at}>
                <GameOver game={game()} />
              </Match>
              <Match when={game().started_at}>
                <Board ws={ws()} game={game()} />
              </Match>
            </Switch>
          )}
        </Show>
      )}
    </Show>
  )
}
