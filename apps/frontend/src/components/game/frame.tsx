import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  type JSXElement,
} from "solid-js"
import {
  containerClass,
  gameRecipe,
  COMBO_ANIMATION_DURATION,
} from "./frame.css"
import { DustParticles } from "./dustParticles"
import { play, SOUNDS } from "../audio"
import { Mountains } from "../mountains"
import { useGameState } from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import { useLayoutSize } from "@/state/constants"

type Props = {
  board: JSXElement
  topLeft: JSXElement
  topRight: JSXElement
  bottomLeft: JSXElement
  bottomRight: JSXElement
}
export function Frame(props: Props) {
  const game = useGameState()
  const globalState = useGlobalState()
  const [comboAnimation, setComboAnimation] = createSignal(0)

  const getDragonCombo = createMemo(() => game.dragonRun?.combo || 0)
  const layout = useLayoutSize()
  const orientation = createMemo(() => layout().orientation)

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

  return (
    <div
      class={gameRecipe({
        comboAnimation: comboAnimation() as any,
      })}
    >
      <div
        class={containerClass({
          orientation: orientation(),
          position: "topLeft",
        })}
      >
        {props.topLeft}
      </div>
      <div
        class={containerClass({
          orientation: orientation(),
          position: "topRight",
        })}
      >
        {props.topRight}
      </div>
      {props.board}
      <div
        class={containerClass({
          orientation: orientation(),
          position: "bottomLeft",
        })}
      >
        {props.bottomLeft}
      </div>
      <div
        class={containerClass({
          orientation: orientation(),
          position: "bottomRight",
        })}
      >
        {props.bottomRight}
      </div>
      <Mountains />
      <DustParticles />
    </div>
  )
}
