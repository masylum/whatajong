import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  type JSXElement,
} from "solid-js"
import { gameRecipe, COMBO_ANIMATION_DURATION } from "./frame.css"
import { DustParticles } from "./dustParticles"
import { isDragon } from "@/lib/game"
import { play, SOUNDS } from "../audio"
import { Mountains } from "../mountains"
import { usePowerupState } from "@/state/powerupState"

type Props = {
  board: JSXElement
  bottom: JSXElement
  top: JSXElement
}
export function Frame(props: Props) {
  const powerups = usePowerupState()
  const [comboAnimation, setComboAnimation] = createSignal(0)

  const getCombo = createMemo(
    () => powerups.all.find((powerup) => isDragon(powerup.card))?.combo || 0,
  )

  createEffect((prevCombo: number) => {
    const combo = getCombo()

    if (combo > prevCombo) {
      setComboAnimation(combo)
      play(SOUNDS.COMBO)
      setTimeout(() => {
        setComboAnimation(0)
      }, COMBO_ANIMATION_DURATION)
    }

    return combo
  }, getCombo())

  onMount(() => {
    play(SOUNDS.GONG)
  })

  return (
    <div
      class={gameRecipe({
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
