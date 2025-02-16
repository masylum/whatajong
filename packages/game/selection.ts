import type { Database } from "./in-memoriam"

export interface Selection {
  id: string
  tileId: string
  playerId: string
  confirmed: boolean
}
export type SelectionById = Record<string, Selection>

export const selectionIndexes = ["tileId", "playerId"] as const
export type SelectionIndexes = (typeof selectionIndexes)[number]
export type SelectionDb = Database<Selection, SelectionIndexes>
