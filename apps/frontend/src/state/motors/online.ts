import { onCleanup, createMemo, type Accessor } from "solid-js"
import { setSessions, onMessage, userId } from "../db"

type DuelParams = {
  id: Accessor<string>
  modality: "duel" | "solo"
}

const API_URL = import.meta.env.API_URL

export function createOnlineMotor(params: DuelParams) {
  const ws = createMemo(() => {
    const ws = new WebSocket(
      `${API_URL}/ws/${params.id()}?id=${userId()}&modality=${params.modality}`,
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
