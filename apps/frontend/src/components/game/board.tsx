import { createEffect, createMemo, createSignal, For } from "solid-js"
import { TileComponent } from "./tileComponent"
import { Players } from "./players"
import { Stats } from "./stats"
import {
  gameRecipe,
  COMBO_ANIMATION_DURATION,
  mountainsClass,
} from "./board.css"
import { DustParticles } from "./dustParticles"
import { getNumber, isDragon } from "@repo/game/deck"
import type { Game } from "@repo/game/game"
import { db, userId } from "@/state/db"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/state/constants"
import { getFinder } from "@repo/game/tile"
import { MAP_LEVELS } from "@repo/game/map"
import { play, SOUNDS } from "./audio"
import { isDeepEqual } from "remeda"

type BoardProps = {
  ws?: WebSocket
  game: Game
}
export function Board(props: BoardProps) {
  const [comboAnimation, setComboAnimation] = createSignal(0)
  const [hover, setHover] = createSignal<string | null>(null)

  const disclosedTile = createMemo(() => {
    const id = hover()
    if (!id) return
    const find = getFinder(db.tiles, db.tiles.get(id)!)

    for (let z = MAP_LEVELS - 1; z >= 1; z--) {
      const leftTile = find(-2, -1, z) || find(-2, 0, z) || find(-2, 1, z)
      if (leftTile) {
        return leftTile.id
      }
    }
  })

  const hiddenImageId = createMemo(() => {
    const id = disclosedTile()
    if (!id) return
    const tile = db.tiles.get(id)!
    return getFinder(db.tiles, tile)(0, 0, -1)?.id
  })

  const dragons = createMemo(
    () => {
      const [left, right] = db.players.all
        .sort((a, b) => a.order - b.order)
        .flatMap((player) =>
          db.powerups
            .filterBy({ playerId: player.id })
            .map((powerup) => isDragon(powerup.card))
            .filter((card) => !!card)
            .map((card) => getNumber(card)),
        )

      return { left, right }
    },
    { equals: isDeepEqual },
  )

  const combo = createMemo(
    () => {
      const [left, right] = db.players.all
        .sort((a, b) => a.order - b.order)
        .flatMap((player) =>
          db.powerups
            .filterBy({ playerId: player.id })
            .map((powerup) => (isDragon(powerup.card) ? powerup.combo : 0)),
        )

      return { left: left, right: right }
    },
    { equals: isDeepEqual },
  )

  createEffect((prevCombo: { left?: number; right?: number }) => {
    const { left, right } = combo()
    const { left: prevLeft, right: prevRight } = prevCombo

    const values = []

    if (left && prevLeft && left > prevLeft) {
      values.push(left)
    }

    if (right && prevRight && right > prevRight) {
      values.push(right)
    }

    if (values.length > 0) {
      const value = values.sort((a, b) => a - b)[0]!
      setComboAnimation(value)
      play(SOUNDS.COMBO)
      setTimeout(() => {
        setComboAnimation(0)
      }, COMBO_ANIMATION_DURATION)
    }

    return { left, right }
  }, combo())

  function onSelect(tile: any) {
    const id = `${tile.id}-${userId()}`
    const selection = {
      id,
      tileId: tile.id,
      playerId: userId(),
      confirmed: false,
    }
    db.selections.set(id, selection)

    props.ws?.send(
      JSON.stringify({
        type: "select-tile",
        id: selection.id,
        selection,
      }),
    )
  }

  return (
    <div
      class={gameRecipe({
        left: dragons().left,
        right: dragons().right,
        leftCombo: (combo().left as any) ?? "0",
        rightCombo: (combo().right as any) ?? "0",
        comboAnimation: comboAnimation() as any,
      })}
    >
      <Players />
      <div
        style={{
          position: "relative",
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          margin: "0 auto",
        }}
      >
        <For each={db.tiles.all}>
          {(tile) => (
            <TileComponent
              tile={tile}
              hovered={hover() === tile.id}
              hideImage={hiddenImageId() === tile.id}
              enhanceVisibility={disclosedTile() === tile.id}
              onSelect={onSelect}
              onMouseEnter={(tile) => setHover(tile.id)}
              onMouseLeave={() => setHover(null)}
            />
          )}
        </For>
      </div>
      <Stats />
      <div class={mountainsClass} />
      <DustParticles />
    </div>
  )
}
