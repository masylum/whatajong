import {
  createMemo,
  createRenderEffect,
  createSignal,
  createEffect,
  For,
  onCleanup,
} from "solid-js"
import { PerfectCursor } from "perfect-cursors"
import { db } from "@/state/db"
import type { Session, WsMessage } from "@repo/game/types"
import { playerColors, sessions, userId } from "@/state/db"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/state/constants"

const CURSOR_UPDATE_INTERVAL = 55

export function CursorArrows(props: {
  websocket?: WebSocket
}) {
  const [abortController] = createSignal(new AbortController())
  const [lastSentTimestamp, setLastSentTimestamp] = createSignal(0)

  createEffect(() => {
    if (!props.websocket) return

    // Get the canvas position
    const getCanvasRect = () => {
      // Canvas is centered in the window
      const canvasLeft = (window.innerWidth - CANVAS_WIDTH) / 2
      const canvasRight = canvasLeft + CANVAS_WIDTH
      const canvasTop = Math.max(0, (window.innerHeight - CANVAS_HEIGHT) / 2)
      const canvasBottom = canvasTop + CANVAS_HEIGHT

      return {
        left: canvasLeft,
        right: canvasRight,
        top: canvasTop,
        bottom: canvasBottom,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    }

    document.addEventListener(
      "mousemove",
      (ev) => {
        const rect = getCanvasRect()

        // Calculate position relative to canvas (0-1)
        // Clamp values to ensure they stay within the canvas
        const relativeX = Math.max(
          0,
          Math.min(1, (ev.pageX - rect.left) / rect.width),
        )
        const relativeY = Math.max(
          0,
          Math.min(1, (ev.pageY - rect.top) / rect.height),
        )

        const now = Date.now()

        if (
          now - lastSentTimestamp() > CURSOR_UPDATE_INTERVAL &&
          props.websocket?.readyState === WebSocket.OPEN
        ) {
          const message = {
            type: "sessions-move",
            id: userId(),
            x: relativeX,
            y: relativeY,
          } as WsMessage
          props.websocket?.send(JSON.stringify(message))
          setLastSentTimestamp(now)
        }
      },
      {
        signal: abortController().signal,
      },
    )
  })

  onCleanup(() => {
    abortController().abort()
  })

  const otherSessions = createMemo(() =>
    Object.values(sessions).filter(
      ({ id, x, y }) => id !== userId() && x !== -1 && y !== -1,
    ),
  )

  return (
    <For each={otherSessions()}>
      {(session) => <CursorArrow session={session} />}
    </For>
  )
}

type Point = [number, number]
function CursorArrow(props: { session: Session }) {
  // Get the canvas position to convert relative coordinates (0-1) to absolute positions
  const getCanvasRect = () => {
    const canvasLeft = (window.innerWidth - CANVAS_WIDTH) / 2
    const canvasTop = Math.max(0, (window.innerHeight - CANVAS_HEIGHT) / 2)

    return {
      left: canvasLeft,
      top: canvasTop,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }
  }

  // Convert relative coordinates (0-1) to actual canvas positions
  const point = createMemo<Point>(() => {
    const rect = getCanvasRect()
    return [
      rect.left + props.session.x * rect.width,
      rect.top + props.session.y * rect.height,
    ]
  })

  const player = createMemo(() => db.players.get(props.session.id)!)
  const [xy, setXy] = createSignal(point())

  PerfectCursor.MAX_INTERVAL = 58

  const [pc, _] = createSignal(
    new PerfectCursor((point) => {
      setXy(point as Point)
    }),
  )

  createRenderEffect(() => {
    pc().addPoint(point())
  })

  // Update the cursor position when window is resized
  createEffect(() => {
    const handleResize = () => {
      const rect = getCanvasRect()
      pc().addPoint([
        rect.left + props.session.x * rect.width,
        rect.top + props.session.y * rect.height,
      ])
    }

    window.addEventListener("resize", handleResize)

    onCleanup(() => {
      window.removeEventListener("resize", handleResize)
    })
  })

  onCleanup(() => pc().dispose())

  const cursorBias = [21, 18] as const
  const cursorColor = createMemo(() => playerColors(player().id)[5])

  return (
    <svg
      height="32"
      width="32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        left: `${xy()[0] - cursorBias[0]}px`,
        top: `${xy()[1] - cursorBias[1]}px`,
        "z-index": 9000,
      }}
    >
      <title>player</title>
      <defs>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1" dy="1" stdDeviation="1.2" flood-opacity="0.5" />
        </filter>
      </defs>
      <g fill="none" transform="rotate(0 16 16)" filter="url(#shadow)">
        <path
          d="M12 24.4219V8.4069L23.591 20.0259H16.81l-.411.124z"
          fill="white"
        />
        <path
          d="M21.0845 25.0962L17.4795 26.6312L12.7975 15.5422L16.4835 13.9892z"
          fill="white"
        />
        <path
          d="M19.751 24.4155L17.907 25.1895L14.807 17.8155L16.648 17.04z"
          fill={cursorColor()}
        />
        <path
          d="M13 10.814V22.002L15.969 19.136l.428-.139h4.768z"
          fill={cursorColor()}
        />
      </g>
    </svg>
  )
}
