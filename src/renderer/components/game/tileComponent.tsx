import { createChangeEffect } from "@/lib/createChangeEffect"
import {
  type Suit,
  type Tile,
  coord,
  getCard,
  getMaterial,
  isBrush,
  isElement,
  isFree,
  isTaijitu,
  isTaijituActive,
} from "@/lib/game"
import { useLaggingValue } from "@/lib/useOffsetValues"
import { MOVE_DURATION, animate, animations } from "@/state/animationState"
import { getSideSize, useTileSize } from "@/state/constants"
import { useGameState } from "@/state/gameState"
import { useTileState } from "@/state/tileState"
import { getHueColor, hueFromColor, hueFromMaterial } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Show, createMemo, mergeProps } from "solid-js"
import { play } from "../audio"
import { TileBody } from "./tileBody"
import {
  clickableClass,
  heightVar,
  positionerClass,
  pulseClass,
  realXVar,
  realYVar,
  realZVar,
  scoreClass,
  scoreCoinsClass,
  scorePointsClass,
  sideSizeVar,
  smokeClass,
  tileClass,
  tileSvgClass,
  widthVar,
  xVar,
  yVar,
  zVar,
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
  activeBrushes?: Set<Suit>
}

export function TileComponent(iProps: Props) {
  const game = useGameState()
  const tiles = useTileState()
  const tileSize = useTileSize()

  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height },
    iProps,
  )
  const dPath = createMemo(() =>
    strokePath({ width: props.width, height: props.height }),
  )

  const material = createMemo(() =>
    getMaterial({ tile: props.tile, tileDb: tiles, game }),
  )
  const canBeSelected = createMemo(() => isFree(tiles, props.tile, game))
  const taijituActive = createMemo(() => isTaijituActive(props.tile, tiles))

  const animation = createMemo(() => animations[props.tile.id]?.name)
  const selected = createMemo(() => props.tile.selected)
  const card = createMemo(() => getCard(props.tile.cardId))
  const isBrushed = createMemo(() => props.activeBrushes?.has(card().suit))

  const fillColor = createMemo(() => {
    if (selected()) return "#963"

    return "#ffffff"
  })

  const pulsingColor = createMemo(() => {
    if (!canBeSelected()) return
    if (game.tutorialStep && game.tutorialStep === 3) return card().colors[0]

    const elementCard = isElement(props.tile.cardId)
    if (elementCard) return elementCard.rank

    const taijituCard = isTaijitu(props.tile.cardId)
    if (taijituCard && taijituActive()) return taijituCard.rank

    const brushCard = isBrush(props.tile.cardId)
    if (brushCard) return brushCard.rank

    return
  })

  const fillOpacity = createMemo(() => {
    const sel = selected()
    if (sel) return 0.5
    if (props.hovered && canBeSelected()) return 0.3

    return 0
  })

  const x = useLaggingValue(() => props.tile.x, MOVE_DURATION)
  const y = useLaggingValue(() => props.tile.y, MOVE_DURATION)
  const z = useLaggingValue(() => props.tile.z, MOVE_DURATION)

  const inlineVars = createMemo(() =>
    assignInlineVars({
      [xVar]: `${x()}`,
      [yVar]: `${y()}`,
      [zVar]: `${z()}`,
      [widthVar]: `${props.width}px`,
      [heightVar]: `${props.height}px`,
      [sideSizeVar]: `${tileSize().sideSize}px`,
      [realXVar]: `${props.tile.x}`,
      [realYVar]: `${props.tile.y}`,
      [realZVar]: `${props.tile.z}`,
    }),
  )

  function mutate() {
    if (props.tile.deleted) return
    animate({ id: props.tile.id, name: "mutate" })
  }

  createChangeEffect(mutate, material)
  createChangeEffect(mutate, isBrushed)

  return (
    <>
      <Show when={animation() === "deleted"}>
        <div class={smokeClass} style={{ ...inlineVars() }} />
        <div class={scoreClass} style={{ ...inlineVars() }}>
          <Show when={props.tile.coins}>
            {(coins) => <span class={scoreCoinsClass}>+{coins()}</span>}
          </Show>
          <Show when={props.tile.points}>
            {(points) => <span class={scorePointsClass}>+{points()}</span>}
          </Show>
        </div>
      </Show>
      <div
        style={{ ...inlineVars() }}
        class={positionerClass({ animation: animation() })}
      >
        <div
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
                isBrushed={isBrushed()}
              />

              {/* Clickable overlay with hover effect */}
              <path
                d={dPath()}
                fill={fillColor()}
                fill-opacity={fillOpacity()}
                stroke={getHueColor(hueFromMaterial(material()))(40)}
                stroke-width={selected() ? 2 : 1}
                class={clickableClass({
                  canBeSelected: canBeSelected() && !animation(),
                })}
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
      </div>
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
