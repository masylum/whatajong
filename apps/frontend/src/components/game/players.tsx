import { createMemo, For, Show } from "solid-js"
import { db, playerColors } from "@/state/db"
import {
  barClass,
  barImageClass,
  barPlayerClass,
  barsClass,
  barStrengthClass,
  comboRecipe,
  playerClass,
  playerIdClass,
  playerPowerupsClass,
  playersClass,
  powerupRecipe,
  powerupTileRecipe,
} from "./players.css"
import {
  getNumber,
  isDragon,
  STRENGTH_SUITS,
  type StrengthSuit,
} from "@repo/game/deck"
import { STRENGTH_THRESHOLD } from "@repo/game/game"
import NumberFlow from "solid-number-flow"
import type { Player } from "@repo/game/player"
import { getComboMultiplier, type Powerup } from "@repo/game/powerups"
import { getPlayerStrength } from "@repo/game/player"
import { Avatar } from "@/components/avatar"
import { BasicTile } from "./basicTile"

export function Players() {
  const firstPlayer = createMemo(() => db.players.all[0]!)
  const secondPlayer = createMemo(() => db.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <div class={barsClass}>
          <For each={STRENGTH_SUITS}>{(suit) => <SuitBar suit={suit} />}</For>
        </div>
        <PlayerComponent player={secondPlayer()} />
      </Show>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  const powerups = createMemo(() =>
    db.powerups.filterBy({ playerId: props.player.id }),
  )
  const pColors = createMemo(() => playerColors(props.player.id))

  return (
    <div class={playerClass} style={{ color: pColors()[1] }}>
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

function SuitBar(props: { suit: StrengthSuit }) {
  const players = createMemo(() => db.players.all)

  const firstPlayerStrength = createMemo(() =>
    getPlayerStrength(props.suit, players()[0]!.id, db.tiles),
  )
  const secondPlayerStrength = createMemo(() =>
    getPlayerStrength(props.suit, players()[1]!.id, db.tiles),
  )

  function getPulse(num: number) {
    const sign = Math.sign(num)
    return (
      ((Math.min(Math.abs(num), STRENGTH_THRESHOLD) * sign) /
        STRENGTH_THRESHOLD /
        2) *
      100
    )
  }

  const firstPlayerPulse = createMemo(
    () => firstPlayerStrength() - secondPlayerStrength(),
  )
  const secondPlayerPulse = createMemo(
    () => secondPlayerStrength() - firstPlayerStrength(),
  )

  return (
    <div
      class={barClass({ color: props.suit })}
      data-second={secondPlayerStrength()}
      data-first={firstPlayerStrength()}
    >
      <img
        alt={props.suit}
        src={`/tiles3/${props.suit}.webp`}
        width={20}
        height={20}
        data-pulse={secondPlayerPulse()}
        class={barImageClass({ suit: props.suit })}
      />
      <div
        class={barStrengthClass({ suit: props.suit })}
        style={{
          left: `calc(50% + ${getPulse(secondPlayerPulse())}%)`,
        }}
      >
        {Math.max(firstPlayerPulse(), secondPlayerPulse())}
      </div>
      <Show when={firstPlayerPulse() > 0}>
        <div
          class={barPlayerClass({ suit: props.suit })}
          style={{
            width: `calc(${getPulse(firstPlayerPulse())}% - 10px)`,
            right: "50%",
          }}
        />
      </Show>
      <Show when={secondPlayerPulse() > 0}>
        <div
          class={barPlayerClass({ suit: props.suit })}
          style={{
            width: `calc(${getPulse(secondPlayerPulse())}% - 10px)`,
            left: "50%",
          }}
        />
      </Show>
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
