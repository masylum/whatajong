import { createMemo, For, Show } from "solid-js"
import { usePowerupState } from "@/state/powerupState"
import { comboRecipe, playerPowerupsClass, powerupRecipe } from "./powerups.css"
import { getRank, isDragon, type Powerup } from "@/lib/game"
import { MiniTile } from "../miniTile"

export function Powerups() {
  const powerups = usePowerupState()

  return (
    <div class={playerPowerupsClass}>
      <For each={powerups.all}>
        {(powerup) => <PowerupComponent powerup={powerup} />}
      </For>
    </div>
  )
}

function PowerupComponent(props: { powerup: Powerup }) {
  const dragonVariant = createMemo(() => {
    const dragon = isDragon(props.powerup.card)
    if (!dragon) return undefined

    return getRank(dragon)
  })

  return (
    <div
      class={powerupRecipe({
        dragon: dragonVariant(),
        size: props.powerup.combo as any,
      })}
    >
      <MiniTile card={props.powerup.card} size={48} />
      <Show when={isDragon(props.powerup.card)}>
        <span class={comboRecipe({ dragon: dragonVariant() })}>
          dragon run +{props.powerup.combo} mult
        </span>
      </Show>
    </div>
  )
}
