import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  type JSXElement,
} from "solid-js"
import { gameRecipe, COMBO_ANIMATION_DURATION } from "./frame.css"
import { DustParticles } from "./dustParticles"
import { play, SOUNDS } from "../audio"
import { Mountains } from "../mountains"
import { useGameState } from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import createGameTour from "@/lib/createGameTour"

type Props = {
  board: JSXElement
  bottom: JSXElement
  top: JSXElement
}
export function Frame(props: Props) {
  const game = useGameState()
  const globalState = useGlobalState()
  const [comboAnimation, setComboAnimation] = createSignal(0)

  const getDragonCombo = createMemo(() => game.dragonRun?.combo || 0)

  // TODO: Move to powerups?
  createEffect((prevCombo: number) => {
    const combo = getDragonCombo()

    if (combo > prevCombo) {
      setComboAnimation(combo)
      play(SOUNDS.GRUNT, globalState.muted)
      setTimeout(() => {
        setComboAnimation(0)
      }, COMBO_ANIMATION_DURATION)
    }

    return combo
  }, getDragonCombo())

  onMount(() => {
    play(SOUNDS.GONG, globalState.muted)
  })

  onMount(() => {
    createGameTour()
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
