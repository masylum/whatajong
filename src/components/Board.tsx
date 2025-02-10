import { type Component, createEffect, createMemo, For } from "solid-js"
import { createResource } from "solid-js"
import type { Position } from "~/types"
import type { GameEvent } from "~/events"
import type { Tile } from "~/gameState"

const SIDE_SIZE = 8
const TILE_HEIGHT = 65
const TILE_WIDTH = 45
const TILE_THEIGHT = TILE_HEIGHT + SIDE_SIZE
const TILE_TWIDTH = TILE_WIDTH + SIDE_SIZE
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

// Add shadow constants
const ALPHA_HIDE = 0.25
const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)"

interface GameState {
  success: boolean
  tiles: Array<{
    position: Position
    card: string
  }>
  events: GameEvent[]
  version: number
}

interface BoardProps {
  gameId: string
}

function getRealCoordinates(position: Position) {
  const x = (((position.x - 1) * TILE_WIDTH) / 2) | 0
  const y = SIDE_SIZE + (((position.y * TILE_HEIGHT) / 2) | 0)
  const z = position.z || 0

  return {
    x: z ? x + z * SIDE_SIZE : x,
    y: z ? y - z * SIDE_SIZE : y,
  }
}

function getImageLocation(cardface: string) {
  const type = cardface[0]
  const number = cardface[1]

  switch (type) {
    case "b":
      return { y: 0, x: (Number(number) - 1) * TILE_WIDTH }
    case "c":
      return { y: TILE_HEIGHT, x: (Number(number) - 1) * TILE_WIDTH }
    case "o":
      return { y: 2 * TILE_HEIGHT, x: (Number(number) - 1) * TILE_WIDTH }
    case "h":
      return { y: 3 * TILE_HEIGHT, x: (Number(number) - 1) * TILE_WIDTH }
    case "w":
      return { y: 4 * TILE_HEIGHT, x: (Number(number) + 2) * TILE_WIDTH }
    case "d":
      switch (number) {
        case "c":
          return { y: 4 * TILE_HEIGHT, x: 0 }
        case "f":
          return { y: 4 * TILE_HEIGHT, x: TILE_WIDTH }
        case "p":
          return { y: 4 * TILE_HEIGHT, x: 2 * TILE_WIDTH }
      }
  }
  return { x: 0, y: 0 }
}

function sortTiles(tiles: Tile[]) {
  return tiles.toSorted((a, b) => {
    // Sort by layer (z) first
    const zDiff = (a.position.z || 0) - (b.position.z || 0)
    if (zDiff !== 0) return zDiff

    // sort by x (left to right)
    const xDiff = b.position.x - a.position.x
    if (xDiff !== 0) return xDiff

    // sort by y (top to bottom)
    return a.position.y - b.position.y
  })
}

function TileSVG(props: {
  position: Position
  card: string
}) {
  const coords = getRealCoordinates(props.position)
  const x = coords.x
  const y = coords.y
  const imageLoc = getImageLocation(props.card)
  const clipId = `clip-${props.position.x}-${props.position.y}-${props.position.z || 0}`

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Shadows */}
      <path
        d={`M ${SIDE_SIZE} 0 L ${SIDE_SIZE * 2} -${SIDE_SIZE} L ${TILE_TWIDTH - SIDE_SIZE} -${SIDE_SIZE} L ${TILE_TWIDTH - SIDE_SIZE} 0 L ${SIDE_SIZE} 0`}
        fill={SHADOW_COLOR}
        style="pointer-events: none"
      />
      <path
        d={`M ${TILE_TWIDTH} ${SIDE_SIZE} L ${TILE_TWIDTH + SIDE_SIZE} ${SIDE_SIZE} L ${TILE_TWIDTH + SIDE_SIZE} ${TILE_HEIGHT - SIDE_SIZE} L ${TILE_TWIDTH} ${TILE_HEIGHT} L ${TILE_TWIDTH} ${SIDE_SIZE}`}
        fill={SHADOW_COLOR}
        style="pointer-events: none"
      />

      {/* Left side */}
      <path
        d={`M 0 ${SIDE_SIZE} L ${SIDE_SIZE} 0 L ${SIDE_SIZE} ${TILE_HEIGHT} L 0 ${TILE_THEIGHT} L 0 ${SIDE_SIZE}`}
        fill="#FFBB89"
        stroke="none"
        style="cursor: pointer"
      />

      {/* Bottom side */}
      <path
        d={`M 0 ${TILE_THEIGHT} L ${SIDE_SIZE} ${TILE_HEIGHT} L ${TILE_TWIDTH} ${TILE_HEIGHT} L ${TILE_WIDTH} ${TILE_THEIGHT} L 0 ${TILE_THEIGHT}`}
        fill="#FF9966"
        stroke="none"
        style="cursor: pointer"
      />

      {/* Define clip path for the tile image */}
      <defs>
        <clipPath id={clipId}>
          <path
            d={`M ${SIDE_SIZE} 0 L ${TILE_TWIDTH} 0 L ${TILE_TWIDTH} ${TILE_HEIGHT} L ${SIDE_SIZE} ${TILE_HEIGHT} Z`}
          />
        </clipPath>
      </defs>

      {/* Body with tile image */}
      <path
        d={`M ${SIDE_SIZE} 0 L ${TILE_TWIDTH} 0 L ${TILE_TWIDTH} ${TILE_HEIGHT} L ${SIDE_SIZE} ${TILE_HEIGHT} L ${SIDE_SIZE} 0`}
        fill="#FEE1A9"
        stroke="none"
      />

      {/* Tile image */}
      <svg
        x={SIDE_SIZE}
        y={0}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        viewBox={`${imageLoc.x} ${imageLoc.y} ${TILE_WIDTH} ${TILE_HEIGHT}`}
        style="cursor: pointer"
      >
        <title>todo</title>
        <image
          href="/tiles.png"
          x="0"
          y="0"
          width={TILE_WIDTH * 9}
          height={TILE_HEIGHT * 5}
        />
      </svg>

      {/* Clickable overlay with hover effect */}
      <path
        d={`M 0 ${SIDE_SIZE} L ${SIDE_SIZE} 0 L ${TILE_TWIDTH} 0 L ${TILE_TWIDTH} ${TILE_HEIGHT} L ${TILE_WIDTH} ${TILE_THEIGHT} L 0 ${TILE_THEIGHT} Z`}
        fill="rgba(255, 255, 255, 0)"
        stroke="#520"
        style="cursor: pointer"
        onMouseEnter={e => {
          e.currentTarget.setAttribute("fill", "rgba(255, 255, 255, 0.3)")
        }}
        onMouseLeave={e => {
          e.currentTarget.setAttribute("fill", "rgba(255, 255, 255, 0)")
        }}
      />
    </g>
  )
}

export const Board: Component<BoardProps> = props => {
  const [gameState] = createResource(
    () => props.gameId,
    async (gameId: string) => {
      const response = await fetch(`http://localhost:3000/api/games/${gameId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch game state")
      }
      return response.json()
    },
  )

  const sortedTiles = createMemo(() => sortTiles(gameState()?.tiles ?? []))

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        <title>Board</title>
        <For each={sortedTiles()}>
          {tile => <TileSVG position={tile.position} card={tile.card} />}
        </For>
      </svg>
    </div>
  )
}
