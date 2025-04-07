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
import { MiniTile } from "../miniTile"
import { useGameState } from "@/state/gameState"
import { useTileSize } from "@/state/constants"

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
  const hue = createMemo(() => {
    const rank = getRank(props.dragonRun.card)
    switch (rank) {
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
  const card = createMemo(() => props.dragonRun.card)
  const tileSize = useTileSize()
  const combo = createMemo(() => props.dragonRun.combo)

  return (
    <div
      class={powerupRecipe({
        hue: hue(),
        size: combo() as any,
        side: "left",
      })}
    >
      <MiniTile card={card()} size={tileSize().width} />
      <span data-tour="dragon-run" class={comboRecipe({ hue: hue() })}>
        +{combo()} mult
      </span>
    </div>
  )
}

function PhoenixRunComponent(props: { phoenixRun: PhoenixRun }) {
  const combo = createMemo(() => props.phoenixRun.combo)
  const card = createMemo(() => props.phoenixRun.card)
  const number = createMemo(() => props.phoenixRun.number ?? 0)

  return (
    <div
      class={powerupRecipe({
        size: combo() as any,
        hue: "bronze",
        side: "right",
      })}
    >
      <span class={phoenixComboClass}>{number() + 1}</span>
      <span class={comboRecipe({ hue: "bronze" })}>+{combo()} mult</span>
      <MiniTile card={card()} size={48} />
    </div>
  )
}

function RabbitRunComponent(props: { rabbitRun: RabbitRun }) {
  const combo = createMemo(() => props.rabbitRun.combo)

  return (
    <div
      class={powerupRecipe({
        size: props.rabbitRun.combo as any,
        hue: "gold",
        side: "top",
      })}
    >
      <MiniTile card={props.rabbitRun.card} size={48} />
      <span class={comboRecipe({ hue: "gold" })}>
        rabbit run +{combo()} mult
      </span>
    </div>
  )
}
