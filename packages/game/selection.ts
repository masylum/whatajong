import { Database } from "./in-memoriam"

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
  const selectionsDb = new Database<Selection, SelectionIndexes>({
    indexes: selectionIndexes,
  })

  for (const selection of Object.values(selections)) {
    selectionsDb.set(selection.id, selection)
  }

  return selectionsDb
}
