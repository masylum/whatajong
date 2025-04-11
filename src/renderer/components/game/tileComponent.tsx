import {
  type Tile,
  getMaterial,
  isDragon,
  isFlower,
  isFree,
  isMutation,
  isPhoenix,
  isRabbit,
  isSeason,
  isWind,
  mapGetHeight,
  mapGetWidth,
} from "@/lib/game"
import { getSideSize, useTileSize } from "@/state/constants"
import { useGameState } from "@/state/gameState"
import { useTileState } from "@/state/tileState"
import { getHueColor } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { isDeepEqual } from "remeda"
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
} from "solid-js"
import { play } from "../audio"
import { TileBody } from "./tileBody"
import {
  FLOATING_NUMBER_DURATION,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  type TileVariants,
  clickableClass,
  scoreClass,
  scoreCoinsClass,
  scorePointsClass,
  tileAnimationDelayVar,
  tileClass,
  tileSvgClass,
} from "./tileComponent.css"
import { TileImage } from "./tileImage"
import { TileShades } from "./tileShades"
import { TileSide } from "./tileSide"

type Props = {
  tile: Tile
  hovered: boolean
  onSelect: (tile: Tile) => void
  onMouseEnter: (tile: Tile) => void
  onMouseLeave: () => void
  width?: number
  height?: number
}
type State = "idle" | "selected" | "deleted"

export function TileComponent(iProps: Props) {
  const game = useGameState()
  const tiles = useTileState()
  const tileSize = useTileSize()

  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height },
    iProps,
  )
  const sideSize = createMemo(() => getSideSize(props.height))

  const coords = createMemo(
    () => {
      const x = props.tile.x
      const y = props.tile.y
      const z = props.tile.z
      const baseX = (x * props.width) / 2
      const baseY = (y * props.height) / 2

      return {
        x: baseX + z * -sideSize(),
        y: baseY + z * -sideSize(),
      }
    },
    { equal: isDeepEqual },
  )
  const dPath = createMemo(() =>
    strokePath({ width: props.width, height: props.height }),
  )

  const material = createMemo(() => getMaterial(tiles, props.tile, game))
  const canBeSelected = createMemo(() => isFree(tiles, props.tile, game))
  const mapWidth = createMemo(() => mapGetWidth())
  const mapHeight = createMemo(() => mapGetHeight())

  const zIndex = createMemo(() => {
    const zLayer = props.tile.z * mapWidth() * mapHeight()
    const xScore = props.tile.x * 2
    const yScore = props.tile.y * 3
    return zLayer + xScore + yScore
  })
  const [animation, setAnimation] =
    createSignal<TileVariants["animation"]>("fall")
  const [deleted, setDeleted] = createSignal(props.tile.deleted)
  const selected = createMemo(() => props.tile.selected)
  const state = createMemo<State>(() => {
    if (selected()) return "selected"
    if (props.tile.deleted) return "deleted"

    return "idle"
  })

  const fillColor = createMemo(() => {
    if (selected()) return "#963"

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
      setAnimation("shake")
      play("shake")
      setTimeout(() => {
        setAnimation(undefined)
      }, SHAKE_DURATION * SHAKE_REPEAT)

      return currentState
    }

    // when refreshing the board
    if (prevState === "deleted" && currentState === "idle") {
      setDeleted(false)
      return currentState
    }

    if (prevState !== "deleted" && currentState === "deleted") {
      if (isDragon(props.tile.card)) {
        play("dragon")
      } else if (isFlower(props.tile.card)) {
        play("flower")
      } else if (isSeason(props.tile.card)) {
        play("season")
      } else if (isWind(props.tile.card)) {
        play("wind")
      } else if (isPhoenix(props.tile.card)) {
        play("phoenix")
      } else if (isRabbit(props.tile.card)) {
        play("rabbit")
      } else if (isMutation(props.tile.card)) {
        play("mutation")
      } else if (
        props.tile.material === "bronze" ||
        props.tile.material === "gold"
      ) {
        play("metal_ding")
      } else if (
        props.tile.material === "glass" ||
        props.tile.material === "diamond"
      ) {
        play("glass_ding")
      } else if (
        props.tile.material === "ivory" ||
        props.tile.material === "jade"
      ) {
        play("stone_ding")
      } else {
        play("ding")
      }

      setAnimation("deleted")
      setTimeout(() => {
        setAnimation(undefined)
        setDeleted(true)
        if (props.tile.coins) {
          play("coin")
        }
      }, FLOATING_NUMBER_DURATION)
    }

    return currentState
  }, state())

  return (
    <>
      <Show when={animation() === "deleted"}>
        <div
          class={scoreClass}
          style={{
            left: `${coords().x}px`,
            top: `${coords().y}px`,
          }}
        >
          <Show when={props.tile.coins}>
            {(coins) => <span class={scoreCoinsClass}>+{coins()}</span>}
          </Show>
          <Show when={props.tile.points}>
            {(points) => <span class={scorePointsClass}>+{points()}</span>}
          </Show>
        </div>
      </Show>
      <Show when={!deleted()}>
        <div
          style={{
            position: "absolute",
            left: `${coords().x}px`,
            top: `${coords().y}px`,
            overflow: "visible",
            "z-index": zIndex(),
            ...assignInlineVars({
              [tileAnimationDelayVar]: `${props.tile.z * 30 + (props.tile.x + props.tile.y) * 5}ms`,
            }),
          }}
          class={tileClass({ animation: animation() })}
        >
          <svg
            class={tileSvgClass}
            width={props.width}
            height={props.height}
            data-id={props.tile.id}
          >
            <g>
              <TileSide d={dPath()} material={material()} />
              <TileShades tile={props.tile} />
              <TileBody material={material()} />
              <TileImage card={props.tile.card} />

              {/* Clickable overlay with hover effect */}
              <path
                d={dPath()}
                fill={fillColor()}
                fill-opacity={fillOpacity()}
                stroke={getHueColor(material())(40)}
                stroke-width={selected() ? 2 : 1}
                class={clickableClass({ canBeSelected: canBeSelected() })}
                onMouseDown={() => {
                  if (!canBeSelected()) return
                  play("click")
                  props.onSelect(props.tile)
                }}
                onMouseEnter={() => {
                  props.onMouseEnter(props.tile)
                }}
                onMouseLeave={props.onMouseLeave}
              />
            </g>
          </svg>
        </div>
      </Show>
    </>
  )
}

export function strokePath({
  width,
  height,
}: { width: number; height: number }) {
  const sideSize = getSideSize(height)
  const tileSize = useTileSize()
  const corner = createMemo(() => tileSize().corner)

  return `
    M 0 ${corner()}
    v ${height - 3 * corner()}
    t 0 ${corner()}
    t ${sideSize} ${sideSize + corner()}
    h ${width - corner()}
    a ${corner()} ${corner()} 0 0 0 ${corner()} -${corner()}
    v ${-height + 3 * corner()}
    t 0 ${-corner()}
    t ${-sideSize} ${-sideSize - corner()}
    h ${-width + corner()}
    a ${corner()} ${corner()} 0 0 0 -${corner()} ${corner()}
    Z
  `
}
