import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  type JSXElement,
} from "solid-js"
import { gameRecipe, COMBO_ANIMATION_DURATION } from "./board.css"
import { DustParticles } from "./dustParticles"
import { getNumber, isDragon, type Dragons } from "@repo/game/deck"
import { useGameState } from "@/state/gameState"
import { play, SOUNDS } from "../audio"
import { isDeepEqual } from "remeda"
import { Mountains } from "../mountains"

type Props = {
  board: JSXElement
  bottom: JSXElement
  top: JSXElement
}
export function Frame(props: Props) {
  const gameState = useGameState()
  const [comboAnimation, setComboAnimation] = createSignal(0)

  // TODO: move to powerups
  const dragons = createMemo(
    () => {
      const [left, right] = gameState.players.all
        .sort((a, b) => a.order - b.order)
        .map((player) => {
          const powerup = gameState.powerups
            .filterBy({ playerId: player.id })
            .find((powerup) => isDragon(powerup.card))
          if (!powerup) return

          return getNumber(powerup.card as Dragons)
        })

      return { left, right }
    },
    { equals: isDeepEqual },
  )

  // TODO: move to powerups
  const combo = createMemo(
    () => {
      const [left, right] = gameState.players.all
        .sort((a, b) => a.order - b.order)
        .map((player) => {
          const powerup = gameState.powerups
            .filterBy({ playerId: player.id })
            .find((powerup) => isDragon(powerup.card))
          if (!powerup) return

          return powerup.combo
        })

      return { left: left, right: right }
    },
    { equals: isDeepEqual },
  )

  // TODO: move to powerups
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

  onMount(() => {
    play(SOUNDS.GONG)
  })

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
      {props.top}
      {props.board}
      {props.bottom}
      <Mountains />
      <DustParticles />
    </div>
  )
}
