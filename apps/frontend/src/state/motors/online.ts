import { onCleanup, createMemo, type Accessor } from "solid-js"
import { setSessions, onMessage, userId } from "../db"

type DuelParams = {
  id: Accessor<string>
  modality: "duel" | "solo"
}

export function createOnlineMotor(params: DuelParams) {
  const ws = createMemo(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${wsProtocol}://localhost:8787/ws/${params.id()}?id=${userId()}&modality=${params.modality}`,
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

  onCleanup(() => {
    ws()?.close()
  })

  return ws
}
