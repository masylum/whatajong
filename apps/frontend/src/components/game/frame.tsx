import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  type Accessor,
  type JSXElement,
} from "solid-js"
import { createShortcut } from "@solid-primitives/keyboard"
import {
  containerClass,
  gameRecipe,
  COMBO_ANIMATION_DURATION,
} from "./frame.css"
import { DustParticles } from "./dustParticles"
import { play, type Track } from "../audio"
import { Mountains } from "../mountains"
import { useGameState } from "@/state/gameState"
import { useLayoutSize } from "@/state/constants"
import { Powerups } from "./powerups"
import { useTileState } from "@/state/tileState"
import { getAvailablePairs, selectTile } from "@/lib/game"
import { useRunState } from "@/state/runState"

type Props = {
  board: JSXElement
  topLeft: JSXElement
  topRight: JSXElement
  bottomLeft: JSXElement
  bottomRight: JSXElement
}
export function Frame(props: Props) {
  const game = useGameState()
  const [comboAnimation, setComboAnimation] = createSignal(0)

  const getDragonCombo = createMemo(() => game.dragonRun?.combo || 0)
  const getRabbitCombo = createMemo(() => game.rabbitRun?.combo || 0)
  const getPhoenixCombo = createMemo(() => game.phoenixRun?.combo || 0)
  const layout = useLayoutSize()
  const orientation = createMemo(() => layout().orientation)

  function handleComboEffect(
    getCombo: Accessor<number>,
    soundEffect: Track,
    resetAnimation = true,
  ) {
    return createEffect((prevCombo: number) => {
      const combo = getCombo()

      if (combo > prevCombo) {
        setComboAnimation(combo)
        play(soundEffect)

        if (resetAnimation) {
          setTimeout(() => {
            setComboAnimation(0)
          }, COMBO_ANIMATION_DURATION)
        }
      }

      return combo
    }, getCombo())
  }

  handleComboEffect(getDragonCombo, "grunt")
  handleComboEffect(getRabbitCombo, "grunt2")
  handleComboEffect(getPhoenixCombo, "screech", false)

  // Cheat Code!
  const tileDb = useTileState()
  const run = useRunState()
  createShortcut(["Shift", "K"], () => {
    console.log("cheat!")
    const tiles = getAvailablePairs(tileDb, game)[0]
    if (!tiles) return
    for (const tile of tiles) {
      selectTile({ tileDb, run, game, tileId: tile.id })
    }
    game.points += 100
  })

  onMount(() => {
    play("gong")
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
      <Powerups />
    </div>
  )
}
