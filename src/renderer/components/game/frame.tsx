import { getAvailablePairs, selectTile } from "@/lib/game"
import { useLayoutSize } from "@/state/constants"
import { useGameState } from "@/state/gameState"
import { useRunState } from "@/state/runState"
import { useTileState } from "@/state/tileState"
import { createShortcut } from "@solid-primitives/keyboard"
import {
  type Accessor,
  type JSXElement,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"
import { type Track, play } from "../audio"
import { Mountains } from "../mountains"
import { DustParticles } from "./dustParticles"
import {
  COMBO_ANIMATION_DURATION,
  containerClass,
  gameRecipe,
} from "./frame.css"
import { Powerups } from "./powerups"

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
          position: "topLeft",
          orientation: orientation(),
        })}
      >
        {props.topLeft}
      </div>
      <div
        class={containerClass({
          position: "topRight",
          orientation: orientation(),
        })}
      >
        {props.topRight}
      </div>
      {props.board}
      <div
        class={containerClass({
          position: "bottomLeft",
          orientation: orientation(),
        })}
      >
        {props.bottomLeft}
      </div>
      <div
        class={containerClass({
          position: "bottomRight",
          orientation: orientation(),
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
