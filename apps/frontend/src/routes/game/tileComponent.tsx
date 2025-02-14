import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { getTile, isFree } from "@repo/game/map"
import type { Asset, Tile } from "@repo/game/types"
import { db, hover, gameState, setHover, SIDE_SIZES, userId } from "../state"
import {
  shakeAnimation,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  DELETED_DURATION,
  deletedAnimation,
  floatingNumberAnimation,
  FLOATING_NUMBER_DURATION,
  tileTransition,
} from "./tileComponent.css"
import { getPoints } from "@repo/game/deck"
import { TileShades } from "./tileShades"
import { TileImage } from "./tileImage"

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
  const position = createMemo(() => props.tile.position)
  const coords = createMemo(() => {
    const { x, y, z } = position()
    const baseX = (x * TILE_WIDTH) / 2
    const baseY = (y * TILE_HEIGHT) / 2

    return {
      x: baseX + z * -SIDE_SIZES.xSide,
      y: baseY + z * -SIDE_SIZES.ySide,
    }
  })
  const canBeSelected = createMemo(() => isFree(gameState(), props.tile))
  const asset = createMemo(() => gameState().assets[props.tile.id])

  // this is to avoid disclosing the tile when it's helping visibility
  const hideImage = createMemo(() => {
    const { x, y, z } = position()
    return (
      getTile(gameState(), x, y, z + 1) &&
      getTile(gameState(), x + 1, y, z + 1) &&
      getTile(gameState(), x, y + 1, z + 1) &&
      getTile(gameState(), x + 1, y + 1, z + 1)
    )
  })
  const [deleted, setDeleted] = createSignal(props.tile.deleted)
  const [oopsie, setOopsie] = createSignal(false)
  const [animAsset, setAnimAsset] = createSignal<Asset | undefined>(undefined)
  const hovered = createMemo(() => hover() === props.tile)

  const selected = createMemo(() => {
    const all = db.selections
      .all()
      .filter((selection) => selection.tileId === props.tile.id)

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
    if (props.tile.deleted) return false
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
    const deleted = props.tile.deleted

    if (!prevDeleted && deleted) {
      setTimeout(() => {
        setDeleted(true)
      }, DELETED_DURATION)
    }

    return deleted
  }, props.tile.deleted)

  createEffect((prevAsset: Asset | undefined) => {
    const ass = asset()

    if (!prevAsset && asset()) {
      setAnimAsset(asset())
      setTimeout(() => {
        setAnimAsset(undefined)
      }, FLOATING_NUMBER_DURATION)
    }

    return ass // lol
  }, asset())

  const animation = createMemo(() => {
    if (oopsie()) return shakeAnimation
    if (asset()) return deletedAnimation

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

  const enhanceVisibility = createMemo(() => {
    const { x, y, z } = position()

    function getHoveredTile(x: number, y: number, z: number) {
      return getTile(gameState(), x, y, z) === hover()
    }

    function getRightTile(x: number, y: number, z: number) {
      return getHoveredTile(x + 2, y, z) || getHoveredTile(x + 2, y + 1, z)
    }

    if (z === 0) return false
    if (getRightTile(x, y, z)) return false

    for (let checkZ = z - 1; checkZ >= 0; checkZ--) {
      if (getRightTile(x, y, checkZ)) return true
    }

    return false
  })

  return (
    <>
      <Show when={animAsset()}>
        {(asset) => (
          <text
            x={coords().x + TILE_WIDTH / 2}
            y={coords().y + TILE_HEIGHT / 2}
            text-anchor="middle"
            fill={db.players.get(asset().playerId)?.color}
            class={floatingNumberAnimation}
          >
            +{getPoints(asset().card)}
          </text>
        )}
      </Show>
      <Show when={!deleted()}>
        <g
          transform={`translate(${coords().x},${coords().y})`}
          data-id={props.tile.id}
          data-position={JSON.stringify(position())}
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
