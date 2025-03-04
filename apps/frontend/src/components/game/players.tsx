import { createMemo, For, Show } from "solid-js"
import { state, playerColors } from "@/state/state"
import {
  comboRecipe,
  playerClass,
  playerIdClass,
  playerPowerupsClass,
  playersClass,
  powerupRecipe,
  powerupTileRecipe,
} from "./players.css"
import { getNumber, isDragon } from "@repo/game/deck"
import NumberFlow from "solid-number-flow"
import type { Player } from "@repo/game/player"
import { getComboMultiplier, type Powerup } from "@repo/game/powerups"
import { Avatar } from "@/components/avatar"
import { BasicTile } from "./basicTile"

export function Players() {
  const firstPlayer = createMemo(() => state.players.all[0]!)
  const secondPlayer = createMemo(() => state.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <PlayerComponent player={secondPlayer()} />
      </Show>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  const powerups = createMemo(() =>
    state.powerups.filterBy({ playerId: props.player.id }),
  )
  const pColors = createMemo(() => playerColors(props.player.id))

  return (
    <div class={playerClass} style={{ color: pColors()[2] }}>
      <Avatar name={props.player.id} colors={pColors()} />
      <div class={playerIdClass}>
        {props.player.id} ( <NumberFlow value={props.player.points} /> )
      </div>
      <div class={playerPowerupsClass}>
        <For each={powerups()}>
          {(powerup) => <PowerupComponent powerup={powerup} />}
        </For>
      </div>
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
