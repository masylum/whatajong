import { createMemo, For, Show } from "solid-js"
import { useGameState } from "@/state/gameState"
import { comboRecipe, playerPowerupsClass, powerupRecipe } from "./powerups.css"
import { getRank, isDragon } from "@repo/game/deck"
import type { Player } from "@repo/game/player"
import type { Powerup } from "@repo/game/powerups"
import { MiniTile } from "../miniTile"

export function Powerups(props: { player: Player }) {
  const gameState = useGameState()
  const powerups = createMemo(() =>
    gameState.powerups.filterBy({ playerId: props.player.id }),
  )

  return (
    <div class={playerPowerupsClass}>
      <For each={powerups()}>
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
