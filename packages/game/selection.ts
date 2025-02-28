import { type Database, initDatabase } from "./in-memoriam"

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

export function initSelectionsDb(selections: SelectionById): SelectionDb {
  return initDatabase({ indexes: selectionIndexes }, selections)
}
