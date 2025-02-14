import type { Card } from "./deck"
import type { Mapa, Position } from "./map"

export interface Tile {
  id: string
  card: Card
  deleted: boolean
  position: Position
}

export type GameState = {
  map: Mapa
  tiles: TileById
  assets: AssetById
}

export interface Asset {
  id: string
  card: Card
  playerId: string
}

export interface Selection {
  id: string
  tileId: string
  playerId: string
  confirmed: boolean
}

export type PlayerById = Record<string, Player>
export interface Player {
  id: string
  color: string
}

export type SelectionById = Record<string, Selection>
export type TileById = Record<string, Tile>
export type AssetById = Record<string, Asset>

export type Diff = {
  [key in keyof DB]?: { [id: string]: DB[key][string] | null }
}

export type Session = {
  id: string
  x: number
  y: number
  quit: boolean
}

export type DB = {
  tiles: TileById
  selections: SelectionById
  players: PlayerById
  assets: AssetById
}

export type WsMessage =
  | { type: "sessions-quit"; id: string }
  | { type: "sessions-join"; id: string; session: Session }
  | { type: "sessions-move"; id: string; x: number; y: number }
  | { type: "sessions-fetch" }
  | { type: "sessions-sync"; sessions: Session[] }
  | { type: "init-state"; db: DB; timer: number }
  | { type: "sync"; diff: Diff }
  // mutations
  | { type: "select-tile"; id: string; selection: Selection }
