import { createEffect, createMemo, createSignal, Show } from "solid-js"
import {
  CORNER_RADIUS,
  db,
  disclosedTile,
  hiddenImage,
  INNER_PADING,
  hover,
  setHover,
  SIDE_SIZES,
  TILE_HEIGHT,
  TILE_WIDTH,
  userId,
  playerColors,
} from "../state"
import {
  shakeAnimation,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  DELETED_DURATION,
  floatingNumberAnimation,
  FLOATING_NUMBER_DURATION,
  deletedAnimationClass,
  clickableClass,
  tileRecipe,
} from "./tileComponent.css"
import { MAP_HEIGHT, MAP_WIDTH } from "@repo/game/map"
import { TileShades } from "./tileShades"
import { isFree, type Tile } from "@repo/game/tile"
import { VISIBILITY_MASK_ID } from "./defs"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import { colors } from "@/components/colors"
import { getPointsWithCombo } from "@repo/game/powerups"
import { isFlower, isSeason } from "@repo/game/deck"

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
  const canBeSelected = createMemo(() =>
    isFree(db.tiles, props.tile, db.powerups, userId()),
  )
  const zIndex = createMemo(
    () =>
      props.tile.z * MAP_WIDTH * MAP_HEIGHT +
      (MAP_WIDTH - props.tile.x - 1) * MAP_HEIGHT,
    props.tile.y,
  )

  const [deleted, setDeleted] = createSignal(!!props.tile.deletedBy)
  const [oopsie, setOopsie] = createSignal(false)
  const [deletedAnimation, setDeletedAnimation] = createSignal<boolean>(false)
  const hovered = createMemo(() => hover() === props.tile)
  const powerups = createMemo(() =>
    db.powerups.filterBy({ playerId: userId() }),
  )
  const flower = createMemo(() => powerups().find((p) => isFlower(p.card)))
  const season = createMemo(() => powerups().find((p) => isSeason(p.card)))
  const highlight = createMemo(() => {
    if (!canBeSelected()) return "null"
    if (flower()) return "flower"
    if (season()) return "season"

    return "null"
  })

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
    if (sel) return playerColors(sel.playerId)[4] ?? "#963"

    return "#ffffff"
  })

  const fillOpacity = createMemo(() => {
    const sel = selected()
    if (!sel) return hovered() && canBeSelected() ? 0.3 : 0

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

  const enhanceVisibility = createMemo(
    () => disclosedTile()?.id === props.tile.id,
  )
  const hideImage = createMemo(() => hiddenImage()?.id === props.tile.id)

  return (
    <>
      <Show when={deletedAnimation() && props.tile.deletedBy}>
        {(playerId) => (
          <span
            style={{
              left: `${coords().x + TILE_WIDTH / 2 + SIDE_SIZES.xSide}px`,
              top: `${coords().y + TILE_HEIGHT / 2 + 2 * SIDE_SIZES.ySide}px`,
              background: `rgb(from ${playerColors(playerId())[1]} r g b / 0.5)`,
            }}
            class={floatingNumberAnimation}
          >
            +{getPointsWithCombo(db.powerups, playerId(), props.tile)}
          </span>
        )}
      </Show>
      <Show when={!deleted()}>
        <svg
          style={{
            position: "absolute",
            left: `${coords().x}px`,
            top: `${coords().y}px`,
            "z-index": zIndex(),
          }}
          width={TILE_WIDTH + 4 * Math.abs(SIDE_SIZES.xSide)}
          height={TILE_HEIGHT + 4 * Math.abs(SIDE_SIZES.ySide)}
          data-id={props.tile.id}
          data-tile={JSON.stringify(props.tile)}
          class={tileRecipe({ highlight: highlight() })}
        >
          <title>{props.tile.id}</title>
          <g
            class={animation()}
            mask={
              enhanceVisibility() ? `url(#${VISIBILITY_MASK_ID})` : undefined
            }
          >
            <TileSide card={props.tile.card} />
            <TileShades tile={props.tile} />
            <TileBody card={props.tile.card} />
            <Show when={!hideImage()}>
              <image
                href={`/tiles3/${props.tile.card}.webp`}
                x={INNER_PADING - SIDE_SIZES.xSide * 2}
                y={INNER_PADING + SIDE_SIZES.ySide * 2}
                width={TILE_WIDTH - 2 * INNER_PADING}
                height={TILE_HEIGHT - 2 * INNER_PADING}
              />
            </Show>

            {/* Stroke overlay */}
            <path
              d={strokePath}
              fill="none"
              stroke={colors.stroke}
              stroke-width={selected() ? 2 : 1}
            />

            {/* Clickable overlay with hover effect */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: this is a mouse game */}
            <path
              d={strokePath}
              fill={fillColor()}
              fill-opacity={fillOpacity()}
              stroke="none"
              class={clickableClass}
              onMouseEnter={() => {
                setHover(props.tile)
              }}
              onMouseLeave={() => {
                setHover(null)
              }}
              onClick={() => {
                props.onSelect(props.tile)
              }}
            />
          </g>
        </svg>
      </Show>
    </>
  )
}

export const strokePath = `
  M ${-SIDE_SIZES.xSide * 2 + CORNER_RADIUS} ${SIDE_SIZES.ySide * 2}
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
  Z
`
