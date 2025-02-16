import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { db, hover, setHover, SIDE_SIZES, userId } from "../state"
import {
  shakeAnimation,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  DELETED_DURATION,
  floatingNumberAnimation,
  FLOATING_NUMBER_DURATION,
  tileTransition,
  deletedAnimationClass,
} from "./tileComponent.css"
import { getPoints } from "@repo/game/deck"
import { TileShades } from "./tileShades"
import { TileImage } from "./tileImage"
import { fullyOverlaps, getFinder, isFree, type Tile } from "@repo/game/tile"

export const SIDE_GRADIENT_ID = "sideGradient"
export const VISIBILITY_MASK_ID = "visibilityMask"
export const TILE_HEIGHT = 65
export const TILE_WIDTH = 45

const CORNER_RADIUS = 4

type Props = {
  tile: Tile
  onSelect: (tile: Tile) => void
}

export function TileComponent(props: Props) {
  const coords = createMemo(() => {
    const x = props.tile.x
    const y = props.tile.y
    const z = props.tile.z
    const baseX = (x * TILE_WIDTH) / 2
    const baseY = (y * TILE_HEIGHT) / 2

    return {
      x: baseX + z * -SIDE_SIZES.xSide,
      y: baseY + z * -SIDE_SIZES.ySide,
    }
  })
  const canBeSelected = createMemo(() => isFree(db.tiles, props.tile))

  const [deleted, setDeleted] = createSignal(!!props.tile.deletedBy)
  const [oopsie, setOopsie] = createSignal(false)
  const [deletedAnimation, setDeletedAnimation] = createSignal<boolean>(false)
  const hovered = createMemo(() => hover() === props.tile)

  // TODO: display both at the same time
  const selected = createMemo(() => {
    const all = db.selections.filterBy({ tileId: props.tile.id })

    return (
      all.find((selection) => selection.playerId === userId()) ||
      all.find((selection) => selection.playerId !== userId())
    )
  })

  const fillColor = createMemo(() => {
    const sel = selected()
    if (sel) return db.players.get(sel.playerId)?.color ?? "#963"

    return "#ffffff"
  })

  const fillOpacity = createMemo(() => {
    const sel = selected()
    if (!sel) return hovered() ? 0.3 : 0

    return sel.confirmed ? 0.5 : 0.3
  })

  createEffect((prevSelected: boolean) => {
    if (props.tile.deletedBy) return false
    const sel = !!selected()

    if (prevSelected && !sel) {
      setOopsie(true)
      setTimeout(() => {
        setOopsie(false)
      }, SHAKE_DURATION * SHAKE_REPEAT)
      return false
    }

    return sel
  }, !!selected())

  createEffect((prevDeleted: boolean) => {
    const deleted = !!props.tile.deletedBy

    if (!prevDeleted && deleted) {
      setTimeout(() => {
        setDeleted(true)
      }, DELETED_DURATION)

      setDeletedAnimation(true)
      setTimeout(() => {
        setDeletedAnimation(false)
      }, FLOATING_NUMBER_DURATION)
    }

    return deleted
  }, !!props.tile.deletedBy)

  const animation = createMemo(() => {
    if (oopsie()) return shakeAnimation
    if (deletedAnimation()) return deletedAnimationClass

    return undefined
  })

  const strokePath = createMemo(() => {
    return `
      M ${CORNER_RADIUS} 0
      h ${TILE_WIDTH - 2 * CORNER_RADIUS}
      a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
      v ${TILE_HEIGHT - 3 * CORNER_RADIUS}
      t 0 ${CORNER_RADIUS}
      t ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide + CORNER_RADIUS}
      h ${-TILE_WIDTH + CORNER_RADIUS}
      a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
      v ${-TILE_HEIGHT + 3 * CORNER_RADIUS}
      t 0 ${-CORNER_RADIUS}
      t ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide - CORNER_RADIUS}
      Z`
  })

  // TODO: make a reaction instead
  const enhanceVisibility = createMemo(() => {
    const find = getFinder(db.tiles, props.tile)
    const z = props.tile.z

    function getHoveredTile(x: number, y: number, z: number) {
      return find(x, y, z) === hover()
    }

    function getRightTile(z: number) {
      return getHoveredTile(2, 0, z) || getHoveredTile(2, 1, z)
    }

    if (z === 0) return false
    if (getRightTile(0)) return false

    for (let checkZ = 1; checkZ <= z; checkZ++) {
      if (getRightTile(-checkZ)) return true
    }

    return false
  })
  const hideImage = createMemo(() => fullyOverlaps(db.tiles, props.tile, 1))

  return (
    <>
      <Show when={deletedAnimation() && props.tile.deletedBy}>
        {(playerId) => (
          <text
            x={coords().x + TILE_WIDTH / 2}
            y={coords().y + TILE_HEIGHT / 2}
            text-anchor="middle"
            fill={db.players.get(playerId())?.color}
            class={floatingNumberAnimation}
          >
            +{getPoints(props.tile.card)}
          </text>
        )}
      </Show>
      <Show when={!deleted()}>
        <g
          transform={`translate(${coords().x},${coords().y})`}
          data-id={props.tile.id}
          data-tile={JSON.stringify(props.tile)}
          onMouseEnter={() => {
            setHover(props.tile)
          }}
          onMouseLeave={() => {
            setHover(null)
          }}
          class={tileTransition}
        >
          <defs>
            <linearGradient id={`${VISIBILITY_MASK_ID}-${props.tile.id}`}>
              <stop offset="0%" stop-color="white" stop-opacity="1" />
              <stop offset="30%" stop-color="white" stop-opacity="1" />
              <stop offset="100%" stop-color="white" stop-opacity="0.2" />
            </linearGradient>
            <mask id={`mask-${props.tile.id}`}>
              <rect
                x={SIDE_SIZES.xSide}
                y={0}
                width={TILE_WIDTH + Math.abs(SIDE_SIZES.xSide)}
                height={TILE_HEIGHT + Math.abs(SIDE_SIZES.ySide)}
                fill={`url(#${VISIBILITY_MASK_ID}-${props.tile.id})`}
              />
            </mask>
          </defs>
          <g
            class={animation()}
            mask={
              enhanceVisibility() ? `url(#mask-${props.tile.id})` : undefined
            }
          >
            {/* Side */}
            <path d={strokePath()} fill={`url(#${SIDE_GRADIENT_ID})`} />

            {/* Shades */}
            <TileShades tile={props.tile} />

            {/* Body */}
            <path
              d={`M ${CORNER_RADIUS} 0
                h ${TILE_WIDTH - 2 * CORNER_RADIUS}
                a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
                v ${TILE_HEIGHT - 2 * CORNER_RADIUS} 
                a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}
                h ${-TILE_WIDTH + 2 * CORNER_RADIUS}
                a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
                v ${-TILE_HEIGHT + 2 * CORNER_RADIUS}
                a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}
                Z`}
              fill="#FED9A7"
            />

            <Show when={!hideImage()}>
              <TileImage tile={props.tile} />
            </Show>

            {/* Stroke overlay */}
            <path
              d={strokePath()}
              fill="none"
              stroke="#963"
              stroke-width={selected() ? 2 : 1}
            />

            {/* Clickable overlay with hover effect */}
            <Show when={canBeSelected()}>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: this is a mouse game */}
              <path
                d={strokePath()}
                fill={fillColor()}
                fill-opacity={fillOpacity()}
                stroke="none"
                style="cursor: pointer"
                onClick={() => {
                  props.onSelect(props.tile)
                }}
              />
            </Show>
          </g>
        </g>
      </Show>
    </>
  )
}
