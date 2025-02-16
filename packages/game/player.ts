import type { Database } from "./in-memoriam"

export interface Player {
  id: string
  color: string
}
export type PlayerById = Record<string, Player>
export const playerIndexes = [] as const
export type PlayerIndexes = (typeof playerIndexes)[number]
export type PlayerDb = Database<Player, PlayerIndexes>
