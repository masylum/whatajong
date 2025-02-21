import type { SelectionById } from "./selection"
import type { TileById } from "./tile"
import type { PlayerById } from "./player"
import type { PowerupById } from "./powerups"

export type State = {
  tiles: TileById
  selections: SelectionById
  players: PlayerById
  powerups: PowerupById
  points: number
}

export type Session = {
  id: string
  x: number
  y: number
  quit: boolean
}

export type WsMessage =
  | { type: "sessions-quit"; id: string }
  | { type: "sessions-join"; id: string; session: Session }
  | { type: "sessions-move"; id: string; x: number; y: number }
  | { type: "sessions-fetch" }
  | { type: "sessions-sync"; sessions: Session[] }
  | { type: "init-state"; state: State; timer: number }
  | { type: "sync"; state: State }
  // mutations
  | { type: "select-tile"; id: string; selection: Selection }
