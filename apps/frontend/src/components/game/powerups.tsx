import { createMemo, For, Show } from "solid-js"
import { useGameState } from "@/state/gameState"
import {
  comboRecipe,
  playerPowerupsClass,
  powerupRecipe,
  powerupTileRecipe,
} from "./powerups.css"
import { getNumber, isDragon } from "@repo/game/deck"
import type { Player } from "@repo/game/player"
import { getComboMultiplier, type Powerup } from "@repo/game/powerups"
import { BasicTile } from "./basicTile"

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

    return getNumber(dragon)
  })

  return (
    <div class={powerupRecipe({ size: props.powerup.combo as any })}>
      <BasicTile
        class={powerupTileRecipe({ dragon: dragonVariant() })}
        card={props.powerup.card}
      />
      <Show when={isDragon(props.powerup.card)}>
        <span class={comboRecipe({ dragon: dragonVariant() })}>
          x {getComboMultiplier(props.powerup.combo)}
        </span>
      </Show>
    </div>
  )
}
