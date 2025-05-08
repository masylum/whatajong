import { useTranslation } from "@/i18n/useTranslation"
import {
  type DragonRun,
  type PhoenixRun,
  useGameState,
} from "@/state/gameState"
import { hueFromColor } from "@/styles/colors"
import { Show, createMemo } from "solid-js"
import {
  comboMultiplierClass,
  comboRecipe,
  phoenixComboClass,
  playerPowerupsClass,
  powerupRecipe,
} from "./powerups.css"

export function Powerups() {
  const game = useGameState()

  return (
    <div class={playerPowerupsClass}>
      <Show when={game.dragonRun}>
        {(dragonRun) => <DragonRunComponent dragonRun={dragonRun()} />}
      </Show>
      <Show when={game.phoenixRun}>
        {(phoenixRun) => <PhoenixRunComponent phoenixRun={phoenixRun()} />}
      </Show>
    </div>
  )
}

function DragonRunComponent(props: { dragonRun: DragonRun }) {
  const color = createMemo(() => props.dragonRun.color)
  const hue = createMemo(() => hueFromColor(color()))
  const combo = createMemo(() => props.dragonRun.combo)
  const t = useTranslation()

  return (
    <div
      class={powerupRecipe({
        hue: hue(),
        size: combo() as any,
      })}
    >
      <span class={comboRecipe({ hue: hue() })}>
        {t.common.dragonRun()}
        <span class={comboMultiplierClass}>x{combo()}</span>
      </span>
    </div>
  )
}

function PhoenixRunComponent(props: { phoenixRun: PhoenixRun }) {
  const combo = createMemo(() => props.phoenixRun.combo)
  const number = createMemo(() => props.phoenixRun.number)
  const t = useTranslation()

  return (
    <div
      class={powerupRecipe({
        size: combo() as any,
        hue: "bone",
      })}
    >
      <Show when={number()}>
        {(number) => <span class={phoenixComboClass}>{number()}</span>}
      </Show>
      <span class={comboRecipe({ hue: "bone" })}>
        {t.common.phoenixRun()}
        <span class={comboMultiplierClass}>x{combo()}</span>
      </span>
    </div>
  )
}
