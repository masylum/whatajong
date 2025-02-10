import type { Position } from "./types"
import type { Card } from "./deck"

export type GameEvent =
  | {
      type: "GAME_STARTED"
      gameId: string
      timestamp: number
      tiles: { card: Card; position: Position }[]
    }
  | {
      type: "PAIR_REMOVED"
      gameId: string
      timestamp: number
      positions: [Position, Position]
    }
  | { type: "GAME_COMPLETED"; gameId: string; timestamp: number }
  | { type: "GAME_ABANDONED"; gameId: string; timestamp: number }

export interface EventStore {
  events: GameEvent[]
  version: number
}

export function createEventStore(): EventStore {
  return {
    events: [],
    version: 0,
  }
}

export function applyEvent(store: EventStore, event: GameEvent): void {
  store.events.push(event)
  store.version++
}
