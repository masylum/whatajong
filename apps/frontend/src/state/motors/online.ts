import {
  createSignal,
  onCleanup,
  createEffect,
  createMemo,
  type Accessor,
} from "solid-js"
import { setSessions, onMessage, userId } from "../db"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants"
import type { WsMessage } from "@repo/game/types"

const INTERVAL = 55

type DuelParams = {
  id: Accessor<string>
  modality: "duel" | "solo"
}
export function createOnlineMotor(params: DuelParams) {
  const [abortController] = createSignal(new AbortController())
  const [lastSentTimestamp, setLastSentTimestamp] = createSignal(0)

  const ws = createMemo(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${wsProtocol}://localhost:8787/ws/${params.id()}?id=${userId()}`,
    )

    if (params.modality === "duel") {
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "get-cursors" }))
      }
    }

    ws.onmessage = (message) => {
      onMessage(JSON.parse(message.data))
    }

    ws.onclose = () => setSessions({})

    return ws
  })

  createEffect(() => {
    if (params.modality === "solo") return

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

  return ws
}
