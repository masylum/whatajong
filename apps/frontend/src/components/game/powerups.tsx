import { createMemo, Show } from "solid-js"
import { comboRecipe, playerPowerupsClass, powerupRecipe } from "./powerups.css"
import { getRank, type Dragon } from "@/lib/game"
import { MiniTile } from "../miniTile"
import { useGameState } from "@/state/gameState"

export function Powerups() {
  const game = useGameState()

  return (
    <div class={playerPowerupsClass}>
      <Show when={game.dragonRun}>
        {(dragonRun) => <DragonRun dragonRun={dragonRun()} />}
      </Show>
    </div>
  )
}

function DragonRun(props: { dragonRun: { card: Dragon; combo: number } }) {
  const dragonVariant = createMemo(() => getRank(props.dragonRun.card))
  const card = createMemo(() => props.dragonRun.card)
  const combo = createMemo(() => props.dragonRun.combo)

  return (
    <div
      class={powerupRecipe({
        dragon: dragonVariant(),
        size: combo() as any,
      })}
    >
      <MiniTile card={card()} size={48} />
      <span class={comboRecipe({ dragon: dragonVariant() })}>
        dragon run +{combo()} mult
      </span>
    </div>
  )
}
