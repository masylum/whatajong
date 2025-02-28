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
