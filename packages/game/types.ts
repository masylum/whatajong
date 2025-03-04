import type { SelectionById } from "./selection"
import type { TileById } from "./tile"
import type { PowerupById } from "./powerups"
import type { Game } from "./game"
import type { PlayerById } from "./player"
import type { Tile, TileIndexes } from "./tile"
import type { Selection, SelectionIndexes } from "./selection"
import type { Player, PlayerIndexes } from "./player"
import type { Powerup, PowerupIndexes } from "./powerups"
import type { Database, Value } from "./in-memoriam"

export type RawState = {
  tiles: TileById
  selections: SelectionById
  players: PlayerById
  powerups: PowerupById
  game: Game
}

export type State = {
  tiles: Database<Tile, TileIndexes>
  selections: Database<Selection, SelectionIndexes>
  players: Database<Player, PlayerIndexes>
  powerups: Database<Powerup, PowerupIndexes>
  game: Value<Game>
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
  | { type: "restart-game" }
  | { type: "sync"; state: RawState }
  // mutations
  | { type: "select-tile"; id: string; selection: Selection }
