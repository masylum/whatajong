import {
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
} from "solid-js"
import { PerfectCursor } from "perfect-cursors"
import { CANVAS_HEIGHT, CANVAS_WIDTH, db } from "../state"
import type { Session } from "@repo/game/types"
import { playerColors } from "../state"

type Point = [number, number]
export function CursorArrow(props: { session: Session }) {
  const point = createMemo<Point>(() => [
    props.session.x * CANVAS_WIDTH,
    props.session.y * CANVAS_HEIGHT,
  ])
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
