import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js"
import { useParams } from "@solidjs/router"
import type { WsMessage } from "@repo/game/types"
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  db,
  loading,
  onMessage,
  sessions,
  setSessions,
  setUserId,
  SIDE_SIZES,
  userId,
} from "./state"
import { CursorArrow } from "./game/cursorArrow"
import { SIDE_GRADIENT_ID, TileComponent } from "./game/tileComponent"
import { Players } from "./game/players"
import { Stats } from "./game/stats"
import {
  RIGHT_HALF_SHADE_GRADIENT_ID,
  RIGHT_SHADE_GRADIENT_ID,
  SOFT_SHADE_FILTER_ID,
  TOP_HALF_SHADE_GRADIENT_ID,
  TOP_SHADE_GRADIENT_ID,
} from "./game/tileShades"
import type { Tile, TileById } from "@repo/game/tile"

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

  return <Show when={ws()}>{(ws) => <Board ws={ws()} />}</Show>
}

type BoardProps = {
  ws: WebSocket
}
function Board(props: BoardProps) {
  const sortedTiles = createMemo(() => sortTiles(db.tiles.byId))
  const otherSessions = createMemo(() =>
    Object.values(sessions).filter(
      ({ id, x, y }) => id !== userId() && x !== -1 && y !== -1,
    ),
  )

  return (
    <Show when={!loading()}>
      <div
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Players />
        <Stats />
        <svg
          id="mahjong-board"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        >
          <title>Board</title>
          <defs>
            <filter id={SOFT_SHADE_FILTER_ID}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            </filter>

            <linearGradient
              id={SIDE_GRADIENT_ID}
              gradientTransform="rotate(45)"
            >
              <stop offset="0%" stop-color="#F9CC99" />
              <stop offset="73%" stop-color="#F9BB88" />
              <stop offset="73%" stop-color="#EEAA77" />
              <stop offset="100%" stop-color="#EE8855" />
            </linearGradient>

            <linearGradient
              id={TOP_HALF_SHADE_GRADIENT_ID}
              gradientTransform="rotate(90)"
            >
              <stop offset="50%" stop-color="rgba(0,0,0,0.1)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
            </linearGradient>

            <linearGradient
              id={TOP_SHADE_GRADIENT_ID}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stop-color="rgba(0,0,0,0.1)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
            </linearGradient>

            <linearGradient
              id={RIGHT_HALF_SHADE_GRADIENT_ID}
              gradientTransform="rotate(0)"
            >
              <stop offset="0%" stop-color="rgba(0,0,0,0.3)" />
              <stop offset="50%" stop-color="rgba(0,0,0,0)" />
            </linearGradient>

            <linearGradient
              id={RIGHT_SHADE_GRADIENT_ID}
              gradientTransform="rotate(0)"
            >
              <stop offset="0%" stop-color="rgba(0,0,0,0.3)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <For each={sortedTiles()}>
            {(tile) => (
              <TileComponent
                tile={tile}
                onSelect={(tile) => {
                  const id = `${tile.id}-${userId()}`
                  const selection = {
                    id,
                    tileId: tile.id,
                    playerId: userId(),
                    confirmed: false,
                  }
                  db.selections.set(id, selection)

                  props.ws.send(
                    JSON.stringify({
                      type: "select-tile",
                      id: selection.id,
                      selection,
                    }),
                  )
                }}
              />
            )}
          </For>
        </svg>
        <For each={otherSessions()}>
          {(session) => <CursorArrow session={session} />}
        </For>
      </div>
    </Show>
  )
}

function sortTiles(tiles: TileById): Tile[] {
  return Object.values(tiles).sort((a, b) => {
    const zDiff = a.z - b.z
    if (zDiff !== 0) return zDiff

    const xDiff = b.x - a.x
    if (xDiff !== 0) {
      return xDiff * (SIDE_SIZES.xSide > 0 ? -1 : 1)
    }

    const yDiff = a.y - b.y
    return yDiff * (SIDE_SIZES.ySide < 0 ? -1 : 1)
  })
}
