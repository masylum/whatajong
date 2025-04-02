import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  mergeProps,
} from "solid-js"
import { useTileSize } from "@/state/constants"
import {
  shakeAnimation,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  DELETED_DURATION,
  scoreClass,
  FLOATING_NUMBER_DURATION,
  deletedAnimationClass,
  clickableClass,
  tileClass,
  scorePointsClass,
  scoreCoinsClass,
} from "./tileComponent.css"
import { TileShades } from "./tileShades"
import {
  mapGetHeight,
  mapGetWidth,
  getMaterial,
  isFree,
  isDragon,
  isWind,
  type Tile,
  isSeason,
  isFlower,
  isPhoenix,
  isRabbit,
} from "@/lib/game"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import { play, SOUNDS } from "../audio"
import { isDeepEqual } from "remeda"
import { TileImage } from "./tileImage"
import { useTileState } from "@/state/tileState"
import { useGameState } from "@/state/gameState"
import { getHueColor } from "@/styles/colors"
import { useGlobalState } from "@/state/globalState"

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

  const [deleted, setDeleted] = createSignal(props.tile.deleted)
  const [oopsie, setOopsie] = createSignal(false)
  const [deletedAnimation, setDeletedAnimation] = createSignal<boolean>(false)
  const [numberAnimation, setNumberAnimation] = createSignal<boolean>(false)
  const globalState = useGlobalState()

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
      setOopsie(true)
      play(SOUNDS.SHAKE, globalState.muted)
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

      if (isDragon(props.tile.card)) {
        play(SOUNDS.DRAGON, globalState.muted)
      } else if (isFlower(props.tile.card) || isSeason(props.tile.card)) {
        play(SOUNDS.GONG, globalState.muted)
      } else if (isWind(props.tile.card)) {
        play(SOUNDS.WIND, globalState.muted)
      } else if (isPhoenix(props.tile.card)) {
        play(SOUNDS.PHOENIX, globalState.muted)
      } else if (isRabbit(props.tile.card)) {
        play(SOUNDS.RABBIT, globalState.muted)
      } else if (isFlower(props.tile.card)) {
        play(SOUNDS.FLOWER, globalState.muted)
      } else if (isSeason(props.tile.card)) {
        play(SOUNDS.SEASON, globalState.muted)
      } else if (
        props.tile.material === "bronze" ||
        props.tile.material === "gold"
      ) {
        play(SOUNDS.METAL_DING, globalState.muted)
      } else if (
        props.tile.material === "glass" ||
        props.tile.material === "diamond"
      ) {
        play(SOUNDS.GLASS_DING, globalState.muted)
      } else if (
        props.tile.material === "ivory" ||
        props.tile.material === "jade"
      ) {
        play(SOUNDS.STONE_DING, globalState.muted)
      } else {
        play(SOUNDS.DING, globalState.muted)
      }

      if (props.tile.coins) {
        setTimeout(() => {
          play(SOUNDS.COIN, globalState.muted)
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
      <Show when={numberAnimation()}>
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
          class={tileClass}
        >
          <g class={animation()}>
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
                play(SOUNDS.CLICK, globalState.muted)
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

function getSideSize(height: number) {
  return Math.floor(height / 10)
}
