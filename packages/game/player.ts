import { isJoker, type StrengthSuit } from "./deck"
import { Database } from "./in-memoriam"
import type { TileDb } from "./tile"

export interface Player {
  id: string
  order: number
  points: number
  strength: number
}
export type PlayerById = Record<string, Player>
export const playerIndexes = [] as const
export type PlayerIndexes = (typeof playerIndexes)[number]
export type PlayerDb = Database<Player, PlayerIndexes>

// TODO: dry init methods?
export function initPlayersDb(players: PlayerById): PlayerDb {
  const playersDb = new Database<Player, PlayerIndexes>({
    indexes: playerIndexes,
  })

  for (const player of Object.values(players)) {
    playersDb.set(player.id, player)
  }

  return playersDb
}

export function isMultiplayer(playersDb: PlayerDb) {
  return playersDb.all.length > 1
}

export function getPlayerStrength(
  suit: StrengthSuit,
  playerId: string,
  tileDb: TileDb,
) {
  return (
    tileDb
      .filterBy({ deletedBy: playerId })
      .filter((tile) => tile.card.startsWith(suit) || isJoker(tile.card))
      .length / 2
  )
}
