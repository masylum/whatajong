import { isJoker, type StrengthSuit } from "./deck"
import type { TileDb } from "./tile"
import { initDatabase, type Database } from "./in-memoriam"

export interface Player {
  id: string
  order: number
  points: number
}
export type PlayerById = Record<string, Player>
export const playerIndexes = [] as const
export type PlayerIndexes = (typeof playerIndexes)[number]
export type PlayerDb = Database<Player, PlayerIndexes>

export function initPlayersDb(players: PlayerById): PlayerDb {
  return initDatabase({ indexes: playerIndexes }, players)
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
