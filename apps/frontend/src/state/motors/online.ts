import { onCleanup, createMemo } from "solid-js"
import { setSessions, userId, syncState } from "../state"
import type { GameController } from "./controller"
import type { Selection } from "@repo/game/selection"
import { produce } from "solid-js/store"
import type { WsMessage } from "@repo/game/types"

const API_URL = import.meta.env.VITE_API_URL

export function createOnlineMotor(id: string): GameController {
  const ws = createMemo(() => {
    const ws = new WebSocket(`${API_URL}/ws/${id}?id=${userId()}`)

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "get-cursors" }))
    }

    ws.onmessage = (message) => {
      // TODO: zod?
      const msg = JSON.parse(message.data) as WsMessage
      switch (msg.type) {
        case "sessions-quit":
          setSessions(
            produce((sessions) => {
              delete sessions[msg.id]
            }),
          )
          return
        case "sessions-join":
          setSessions(msg.id, msg.session)
          return
        case "sessions-sync":
          setSessions(
            Object.fromEntries(
              msg.sessions.map((session) => [session.id, session]),
            ),
          )
          return
        case "sessions-move":
          if (msg.id === userId()) return

          setSessions(
            msg.id,
            produce((session) => {
              session.x = msg.x
              session.y = msg.y
            }),
          )
          return
        case "sync":
          console.log(msg)
          syncState(msg.state)
          return
        default:
          break
      }
    }

    ws.onclose = () => setSessions({})

    return ws
  })

  onCleanup(() => {
    ws()?.close()
  })

  return {
    selectTile: (selection: Selection) => {
      ws().send(
        JSON.stringify({
          type: "select-tile",
          id: selection.id,
          selection,
        }),
      )
    },
    restartGame: () => {
      ws().send(JSON.stringify({ type: "restart-game" }))
    },
    getWebSocket: ws,
  }
}
