import {
  type Tile,
  coord,
  getCard,
  getMaterial,
  getTaijituMultiplier,
  isElement,
  isFree,
  isFrog,
  isGem,
  isJoker,
  isMutation,
  isSparrow,
  isTaijitu,
  isWind,
} from "@/lib/game"
import { getSideSize, useTileSize } from "@/state/constants"
import { useGameState } from "@/state/gameState"
import { useTileState } from "@/state/tileState"
import { getHueColor, hueFromColor, hueFromMaterial } from "@/styles/colors"
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
  MUTATE_DURATION,
  SHAKE_DURATION,
  SHAKE_REPEAT,
  type TileVariants,
  clickableClass,
  pulseClass,
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
type State = "idle" | "selected" | "deleted" | "shuffling" | "jumping"

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

  const material = createMemo(() => getMaterial(props.tile, game))
  const canBeSelected = createMemo(() => isFree(tiles, props.tile, game))
  const taijituActive = createMemo(() =>
    isTaijitu(props.tile.cardId)
      ? getTaijituMultiplier(props.tile, tiles) > 0
      : false,
  )

  const zIndex = createMemo(() => {
    const zLayer = props.tile.z
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
    if (game.joker) return "shuffling"
    if (props.tile.jumping) return "jumping"

    return "idle"
  })

  const fillColor = createMemo(() => {
    if (selected()) return "#963"

    return "#ffffff"
  })

  const pulsingColor = createMemo(() => {
    if (!canBeSelected()) return
    if (game.tutorialStep && game.tutorialStep === 3)
      return getCard(props.tile.cardId).colors[0]

    const elementCard = isElement(props.tile.cardId)
    if (elementCard) return elementCard.rank

    const taijituCard = isTaijitu(props.tile.cardId)
    if (taijituCard && taijituActive()) return taijituCard.rank

    return
  })

  const fillOpacity = createMemo(() => {
    const sel = selected()
    if (sel) return 0.5
    if (props.hovered && canBeSelected()) return 0.3

    return 0
  })
  const mutateSource = createMemo(() => `${props.tile.cardId}${material()}`)

  createEffect((prevSource: string) => {
    const source = mutateSource()

    if (source !== prevSource && !props.tile.deleted) {
      setAnimation("mutate")
      setTimeout(() => {
        setAnimation(undefined)
      }, MUTATE_DURATION)
    }

    return source
  }, mutateSource())

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

    if (prevState !== "shuffling" && currentState === "shuffling") {
      setAnimation("deleted")
    }

    if (prevState !== "jumping" && currentState === "jumping") {
      setAnimation("jumpingIn")

      if (isFrog(props.tile.cardId)) {
        play("frog")
      } else if (isSparrow(props.tile.cardId)) {
        play("sparrow")
      }
    } else if (prevState === "jumping" && currentState !== "jumping") {
      if (!isFrog(props.tile.cardId)) {
        play("lotus")
      }
      setAnimation("jumpingOut")
    }

    if (prevState !== "deleted" && currentState === "deleted") {
      if (isWind(props.tile.cardId)) {
        play("wind")
      } else if (isMutation(props.tile.cardId)) {
        play("mutation")
      } else if (isJoker(props.tile.cardId)) {
        play("joker")
      } else if (isGem(props.tile.cardId)) {
        play("gemstone")
        // TODO: only when they are together?
      } else if (isTaijitu(props.tile.cardId)) {
        play("gong2")
      } else {
        play("ding")
      }

      setAnimation("deleted")
      setTimeout(() => {
        setAnimation(undefined)
        setDeleted(true)
      }, FLOATING_NUMBER_DURATION)

      if (props.tile.coins) {
        setTimeout(() => {
          play("coin")
        }, 100)
      }
    }

    return currentState
  }, state())

  return (
    <>
      <Show when={animation() === "deleted"}>
        <div
          class={scoreClass}
          style={{
            left: `${coords().x + tileSize().width / 2}px`,
            top: `${coords().y + tileSize().height / 2}px`,
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
            width: `${props.width + tileSize().sideSize}px`,
            height: `${props.height + tileSize().sideSize}px`,
            "z-index": zIndex(),
            ...assignInlineVars({
              [tileAnimationDelayVar]: `${props.tile.z * 30 + (props.tile.x + props.tile.y) * 5}ms`,
            }),
          }}
          data-id={props.tile.id}
          data-coord={coord(props.tile)}
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
              <TileImage
                cardId={props.tile.cardId}
                material={material()}
                free={canBeSelected()}
                taijituActive={taijituActive()}
              />

              {/* Clickable overlay with hover effect */}
              <path
                d={dPath()}
                fill={fillColor()}
                fill-opacity={fillOpacity()}
                stroke={getHueColor(hueFromMaterial(material()))(40)}
                stroke-width={selected() ? 2 : 1}
                class={clickableClass({ canBeSelected: canBeSelected() })}
                onPointerDown={() => {
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
          <Show when={pulsingColor()}>
            {(color) => (
              <div class={pulseClass({ hue: hueFromColor(color()) })} />
            )}
          </Show>
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
