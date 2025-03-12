import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  mergeProps,
} from "solid-js"
import { userId, playerColors, useGameState } from "@/state/gameState"
import { CORNER_RADIUS, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
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
import { mapGetHeight, mapGetWidth, mapName } from "@repo/game/map"
import { TileShades } from "./tileShades"
import { getMaterial, isFree, type Tile } from "@repo/game/tile"
import { VISIBILITY_MASK_ID } from "./defs"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import { color, alpha } from "@/styles/colors"
import { isDragon, isFlower, isJoker, isSeason, isWind } from "@repo/game/deck"
import { play, SOUNDS } from "../audio"
import { isDeepEqual } from "remeda"
import { TileImage } from "./tileImage"
import { maps } from "@repo/game/map"
import { getCoins } from "@repo/game/game"

type Props = {
  tile: Tile
  hovered: boolean
  enhanceVisibility: boolean
  hideImage: boolean
  onSelect: (tile: Tile) => void
  onMouseEnter: (tile: Tile) => void
  onMouseLeave: () => void
  width?: number
  height?: number
}
type State = "idle" | "selected" | "deleted"

export function TileComponent(iProps: Props) {
  const gameState = useGameState()
  const props = mergeProps({ width: TILE_WIDTH, height: TILE_HEIGHT }, iProps)
  const sideSize = createMemo(() => Math.floor(props.height / 10))

  const coords = createMemo(
    () => {
      const x = props.tile.x
      const y = props.tile.y
      const z = props.tile.z
      const baseX = (x * props.width) / 2
      const baseY = (y * props.height) / 2

      return {
        x: baseX + z * sideSize(),
        y: baseY + z * -sideSize(),
      }
    },
    { equal: isDeepEqual },
  )
  const dPath = createMemo(() =>
    strokePath({ width: props.width, height: props.height }),
  )

  const material = createMemo(() =>
    getMaterial(props.tile, gameState.powerups, userId()),
  )

  const canBeSelected = createMemo(() =>
    isFree(gameState.tiles, props.tile, gameState.powerups, userId()),
  )

  const map = createMemo(() => maps[mapName(gameState.tiles.all.length)])
  const mapWidth = createMemo(() => mapGetWidth(map()))
  const mapHeight = createMemo(() => mapGetHeight(map()))

  const zIndex = createMemo(() => {
    const zLayer = props.tile.z * mapWidth() * mapHeight() * 10
    const xScore = (mapWidth() - props.tile.x) * 2
    const yScore = props.tile.y * 3
    return zLayer + xScore + yScore
  })

  const [deleted, setDeleted] = createSignal(!!props.tile.deletedBy)
  const [oopsie, setOopsie] = createSignal(false)
  const [deletedAnimation, setDeletedAnimation] = createSignal<boolean>(false)
  const [numberAnimation, setNumberAnimation] = createSignal<boolean>(false)
  const powerups = createMemo(() =>
    gameState.powerups.filterBy({ playerId: userId() }),
  )
  const flower = createMemo(() => powerups().find((p) => isFlower(p.card)))
  const season = createMemo(() => powerups().find((p) => isSeason(p.card)))
  const highlight = createMemo(() => {
    if (!canBeSelected()) return "null"
    if (flower()) return "flower"
    if (season()) return "season"

    return "null"
  })

  const selected = createMemo(
    () => {
      const all = gameState.selections.filterBy({ tileId: props.tile.id })

      return (
        all.find((selection) => selection.playerId === userId()) ||
        all.find((selection) => selection.playerId !== userId())
      )
    },
    { equal: isDeepEqual },
  )

  const state = createMemo<State>(() => {
    if (selected()) return "selected"
    if (props.tile.deletedBy) return "deleted"

    return "idle"
  })

  const fillColor = createMemo(() => {
    const sel = selected()
    if (sel) {
      const player = gameState.players.get(sel.playerId)!
      return playerColors(player)[4] ?? "#963"
    }

    return "#ffffff"
  })

  const fillOpacity = createMemo(() => {
    const sel = selected()
    if (sel) return 0.5
    if (props.hovered && canBeSelected()) return 0.3

    return 0
  })

  createEffect((prevState: State) => {
    const currentState = state()

    if (prevState === "selected" && currentState === "idle") {
      setOopsie(true)
      play(SOUNDS.SHAKE)
      setTimeout(() => {
        setOopsie(false)
      }, SHAKE_DURATION * SHAKE_REPEAT)

      return currentState
    }

    // when refreshing the board
    if (prevState === "deleted" && currentState === "idle") {
      setDeleted(false)
      return currentState
    }

    if (prevState !== "deleted" && currentState === "deleted") {
      setTimeout(() => {
        setDeleted(true)
      }, DELETED_DURATION)

      const volume = props.tile.deletedBy === userId() ? 1 : 0.5

      if (isDragon(props.tile.card)) {
        play(SOUNDS.DRAGON, volume)
      } else if (isJoker(props.tile.card)) {
        play(SOUNDS.GONG, volume)
      } else if (isWind(props.tile.card)) {
        play(SOUNDS.WIND, volume)
      } else {
        play(SOUNDS.DING, volume)
      }

      if (getCoins(props.tile.material)) {
        setTimeout(() => {
          play(SOUNDS.COIN, volume)
        }, 300)
      }

      setDeletedAnimation(true)
      setTimeout(() => {
        setDeletedAnimation(false)
      }, DELETED_DURATION)
    }

    return currentState
  }, state())

  createEffect((prevPoints: number | undefined) => {
    const points = props.tile.points

    if (prevPoints !== points) {
      setNumberAnimation(true)
      setTimeout(() => {
        setNumberAnimation(false)
      }, FLOATING_NUMBER_DURATION)
    }

    return points
  }, props.tile.points)

  const animation = createMemo(() => {
    if (oopsie()) return shakeAnimation
    if (deletedAnimation()) return deletedAnimationClass

    return undefined
  })

  return (
    <>
      <Show when={numberAnimation() && props.tile.deletedBy}>
        {(playerId) => (
          <span
            style={{
              left: `${coords().x + props.width / 2}px`,
              top: `${coords().y + props.height / 2}px`,
              background: alpha(
                playerColors(gameState.players.get(playerId())!)[1],
                0.8,
              ),
            }}
            class={floatingNumberAnimation}
          >
            +{props.tile.points}
          </span>
        )}
      </Show>
      <Show when={!deleted()}>
        <svg
          style={{
            position: "absolute",
            left: `${coords().x}px`,
            top: `${coords().y}px`,
            overflow: "visible",
            "z-index": zIndex(),
          }}
          width={props.width}
          height={props.height}
          data-id={props.tile.id}
          data-tile={JSON.stringify(props.tile)}
          class={tileRecipe({ highlight: highlight() })}
        >
          <g
            class={animation()}
            mask={
              props.enhanceVisibility
                ? `url(#${VISIBILITY_MASK_ID})`
                : undefined
            }
          >
            <TileSide d={dPath()} material={material()} />
            <TileShades tile={props.tile} />
            <TileBody material={material()} />
            <Show when={!props.hideImage}>
              <TileImage card={props.tile.card} />
            </Show>

            {/* Stroke overlay */}
            <path
              d={dPath()}
              fill="none"
              stroke={color.tile30}
              stroke-width={selected() ? 2 : 1}
            />

            {/* Clickable overlay with hover effect */}
            <path
              d={dPath()}
              fill={fillColor()}
              fill-opacity={fillOpacity()}
              stroke="none"
              class={clickableClass({ canBeSelected: canBeSelected() })}
              onMouseDown={() => {
                if (!canBeSelected()) return
                play(SOUNDS.CLICK)
                props.onSelect(props.tile)
              }}
              onMouseEnter={() => {
                props.onMouseEnter(props.tile)
              }}
              onMouseLeave={props.onMouseLeave}
            />
          </g>
        </svg>
      </Show>
    </>
  )
}

export function strokePath({
  width,
  height,
}: { width: number; height: number }) {
  const sideSize = Math.floor(height / 10)

  return `
    M ${CORNER_RADIUS} 0
    h ${width - 2 * CORNER_RADIUS}
    a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
    v ${height - 3 * CORNER_RADIUS}
    t 0 ${CORNER_RADIUS}
    t ${-sideSize} ${sideSize + CORNER_RADIUS}
    h ${-width + CORNER_RADIUS}
    a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
    v ${-height + 3 * CORNER_RADIUS}
    t 0 ${-CORNER_RADIUS}
    t ${sideSize} ${-sideSize - CORNER_RADIUS}
    Z
  `
}
