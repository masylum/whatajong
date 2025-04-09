import { createMemo, Show } from "solid-js"
import {
  comboRecipe,
  phoenixComboClass,
  playerPowerupsClass,
  powerupRecipe,
} from "./powerups.css"
import {
  getRank,
  type DragonRun,
  type PhoenixRun,
  type RabbitRun,
} from "@/lib/game"
import { useGameState } from "@/state/gameState"
import { useTranslation } from "@/i18n/useTranslation"

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
      <Show when={game.rabbitRun}>
        {(rabbitRun) => (
          <Show when={!rabbitRun().score}>
            <RabbitRunComponent rabbitRun={rabbitRun()} />
          </Show>
        )}
      </Show>
    </div>
  )
}

function DragonRunComponent(props: { dragonRun: DragonRun }) {
  const rank = createMemo(() => getRank(props.dragonRun.card))
  const hue = createMemo(() => {
    switch (rank()) {
      case "c":
        return "crack"
      case "b":
        return "bam"
      case "o":
        return "dot"
      default:
        return undefined
    }
  })
  const combo = createMemo(() => props.dragonRun.combo)
  const t = useTranslation()

  return (
    <div
      class={powerupRecipe({
        hue: hue(),
        size: combo() as any,
        side: "left",
      })}
    >
      <span class={comboRecipe({ hue: hue() })}>
        {t.common.dragonRun()} +{combo()} mult
      </span>
    </div>
  )
}

function PhoenixRunComponent(props: { phoenixRun: PhoenixRun }) {
  const combo = createMemo(() => props.phoenixRun.combo)
  const number = createMemo(() => props.phoenixRun.number ?? 0)
  const t = useTranslation()

  return (
    <div
      class={powerupRecipe({
        size: combo() as any,
        hue: "bronze",
        side: "right",
      })}
    >
      <span class={phoenixComboClass}>{number() + 1}</span>
      <span class={comboRecipe({ hue: "bronze" })}>
        {t.common.phoenixRun()} +{combo()} mult
      </span>
    </div>
  )
}

function RabbitRunComponent(props: { rabbitRun: RabbitRun }) {
  const combo = createMemo(() => props.rabbitRun.combo)
  const t = useTranslation()

  return (
    <div
      class={powerupRecipe({
        size: props.rabbitRun.combo as any,
        hue: "gold",
        side: "top",
      })}
    >
      <span class={comboRecipe({ hue: "gold" })}>
        {t.common.rabbitRun()} +{combo()} mult
      </span>
    </div>
  )
}
