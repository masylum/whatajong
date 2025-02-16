import { createMemo, For, Show } from "solid-js"
import { db } from "../state"
import {
  barClass,
  barPlayerClass,
  barsClass,
  playerClass,
  playerIdClass,
  playerPointsClass,
  playersClass,
} from "./players.css"
import { getStrength } from "@repo/game/deck"
import NumberFlow from "solid-number-flow"
import type { Player } from "@repo/game/player"
import { calculatePoints } from "@repo/game/tile"

// TODO: move to game state?
const INITIAL_STRENGTH = 60

const suits = ["b", "c", "o"] as const
type Suit = (typeof suits)[number]

export function Players() {
  const firstPlayer = createMemo(() => db.players.all[0]!)
  const secondPlayer = createMemo(() => db.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <div class={barsClass}>
          <For each={suits}>{(suit) => <SuitBar suit={suit} />}</For>
        </div>
        <PlayerComponent player={secondPlayer()} />
      </Show>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  const deletedTiles = createMemo(() =>
    db.tiles.filterBy({ deletedBy: props.player.id }),
  )

  return (
    <div class={playerClass} style={{ color: props.player.color }}>
      <div class={playerIdClass}>{props.player.id}</div>
      <div class={playerPointsClass}>
        <NumberFlow value={calculatePoints(deletedTiles())} />
      </div>
    </div>
  )
}

function SuitBar(props: { suit: Suit }) {
  const players = createMemo(() => db.players.all)
  const firstPlayer = createMemo(() => players()[0]!)
  const secondPlayer = createMemo(() => players()[1]!)

  function getPlayerStrength(player: Player) {
    return db.tiles
      .filterBy({ deletedBy: player.id })
      .filter((tile) => tile.card.startsWith(props.suit))
      .map((tile) => getStrength(tile.card))
      .reduce((acc, curr) => acc + curr, 0)
  }

  const firstPlayerStrength = createMemo(() => getPlayerStrength(players()[0]!))
  const secondPlayerStrength = createMemo(() =>
    getPlayerStrength(players()[1]!),
  )

  const firstPlayerPulse = createMemo(
    () => INITIAL_STRENGTH + firstPlayerStrength() - secondPlayerStrength(),
  )
  const secondPlayerPulse = createMemo(
    () => INITIAL_STRENGTH + secondPlayerStrength() - firstPlayerStrength(),
  )

  return (
    <div class={barClass}>
      {props.suit}
      <div
        class={barPlayerClass}
        data-pulse={firstPlayerPulse()}
        style={{
          width: `${(firstPlayerPulse() / (2 * INITIAL_STRENGTH)) * 100}%`,
          background: firstPlayer().color,
        }}
      />
      <div
        class={barPlayerClass}
        data-pulse={secondPlayerPulse()}
        style={{
          width: `${(secondPlayerPulse() / (2 * INITIAL_STRENGTH)) * 100}%`,
          background: secondPlayer().color,
        }}
      />
    </div>
  )
}
