import { createMemo, For, Show } from "solid-js"
import { db, points, SIDE_SIZES } from "../state"
import {
  barClass,
  barPlayerClass,
  barsClass,
  comboRecipe,
  playerClass,
  playerIdClass,
  playerPointsClass,
  playerPowerupsClass,
  playersClass,
  powerupRecipe,
} from "./players.css"
import { getNumber, isDragon, STRENGTH_THRESHOLD } from "@repo/game/deck"
import NumberFlow from "solid-number-flow"
import type { Player } from "@repo/game/player"
import { getComboMultiplier, type Powerup } from "@repo/game/powerups"
import { Avatar } from "@/components/avatar"
import { TILE_WIDTH, TILE_HEIGHT, INNER_PADING } from "../state"
import { strokePath } from "./tileComponent"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import { playerColors } from "../state"
import { colors } from "@/components/colors"

const SUIT_COLORS = {
  b: colors.bamboo,
  c: colors.character,
  o: colors.circle,
} as const
const SUIT_SIZE = 24
const SUITS = ["b", "c", "o"] as const
type Suit = (typeof SUITS)[number]

export function Players() {
  const firstPlayer = createMemo(() => db.players.all[0]!)
  const secondPlayer = createMemo(() => db.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <div class={barsClass}>
          <For each={SUITS}>{(suit) => <SuitBar suit={suit} />}</For>
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

  return (
    <div
      class={playerClass}
      style={{ color: playerColors(props.player.id)[2] }}
    >
      <Avatar name={props.player.id} colors={playerColors(props.player.id)} />
      <div class={playerIdClass}>{props.player.id}</div>
      <div class={playerPointsClass}>
        <NumberFlow value={points()} />
      </div>
      <div class={playerPowerupsClass}>
        <For each={powerups()}>
          {(powerup) => <PowerupComponent powerup={powerup} />}
        </For>
      </div>
    </div>
  )
}

function SuitBar(props: { suit: Suit }) {
  const players = createMemo(() => db.players.all)

  function getPlayerStrength(player: Player) {
    return (
      db.tiles
        .filterBy({ deletedBy: player.id })
        .filter((tile) => tile.card.startsWith(props.suit)).length / 2
    )
  }

  const firstPlayerStrength = createMemo(() => getPlayerStrength(players()[0]!))
  const secondPlayerStrength = createMemo(() =>
    getPlayerStrength(players()[1]!),
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

  const firstPlayerPulse = createMemo(() =>
    getPulse(firstPlayerStrength() - secondPlayerStrength()),
  )
  const secondPlayerPulse = createMemo(() =>
    getPulse(secondPlayerStrength() - firstPlayerStrength()),
  )

  return (
    <div
      class={barClass}
      data-second={secondPlayerStrength()}
      data-first={firstPlayerStrength()}
    >
      <img
        alt={props.suit}
        src={`/tiles3/${props.suit}.webp`}
        width={SUIT_SIZE}
        height={SUIT_SIZE}
        data-pulse={secondPlayerPulse()}
        style={{
          position: "absolute",
          top: 0,
          background: `rgba(from ${SUIT_COLORS[props.suit]} r g b / 0.3)`,
          "border-radius": "50%",
          transform: "translate(-50%, -50%)",
          left: `calc(50% + ${secondPlayerPulse()}%)`,
        }}
      />
      <div
        class={barPlayerClass}
        style={{
          width: `calc(${firstPlayerPulse()}% - ${SUIT_SIZE / 2}px)`,
          background: SUIT_COLORS[props.suit],
          right: "50%",
        }}
      />
      <div
        class={barPlayerClass}
        style={{
          width: `calc(${secondPlayerPulse()}% - ${SUIT_SIZE / 2}px)`,
          background: SUIT_COLORS[props.suit],
          left: "50%",
        }}
      />
    </div>
  )
}

function PowerupComponent(props: { powerup: Powerup }) {
  return (
    <div class={powerupRecipe({ size: props.powerup.combo as any })}>
      <svg
        width={TILE_WIDTH + 4 * Math.abs(SIDE_SIZES.xSide)}
        height={TILE_HEIGHT + 4 * Math.abs(SIDE_SIZES.ySide)}
      >
        <TileSide card={props.powerup.card} />
        <TileBody card={props.powerup.card} />

        <image
          href={`/tiles3/${props.powerup.card}.webp`}
          x={INNER_PADING - SIDE_SIZES.xSide * 2}
          y={INNER_PADING + SIDE_SIZES.ySide * 2}
          width={TILE_WIDTH - 2 * INNER_PADING}
          height={TILE_HEIGHT - 2 * INNER_PADING}
        />

        <path d={strokePath} fill="none" stroke="#963" stroke-width="1" />
      </svg>
      <Show when={isDragon(props.powerup.card)}>
        {(dragon) => (
          <span class={comboRecipe({ dragon: getNumber(dragon()) })}>
            x {getComboMultiplier(props.powerup.combo)}
          </span>
        )}
      </Show>
    </div>
  )
}
