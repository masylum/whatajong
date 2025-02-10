import type { GameEvent } from "./events"
import type { GameState, Tile } from "./gameState"
import type { Position } from "./types"
import { PositionMap } from "./map"

export class GameClient {
  private gameId: string
  private state: GameState
  private version = 0
  private eventHandlers: ((event: GameEvent) => void)[] = []

  constructor(gameId: string, initialState: GameState) {
    this.gameId = gameId
    this.state = initialState
  }

  async sync(): Promise<void> {
    const response = await fetch(
      `/api/game/${this.gameId}/events?since=${this.version}`,
    )
    const data = await response.json()

    if (data.success) {
      this.applyEvents(data.events)
      this.version = data.version
    }
  }

  async removePair(pos1: Position, pos2: Position): Promise<boolean> {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: this.gameId,
        positions: [pos1, pos2],
        clientVersion: this.version,
      }),
    })

    const data = await response.json()

    if (data.success) {
      this.applyEvents(data.events)
      this.version = data.version
      return true
    }
    if (data.error === "Client out of sync") {
      this.applyEvents(data.events)
      this.version = data.version
    }

    return false
  }

  private applyEvents(events: GameEvent[]): void {
    for (const event of events) {
      this.applyEvent(event)
      this.notifyEventHandlers(event)
    }
  }

  private applyEvent(event: GameEvent): void {
    switch (event.type) {
      case "GAME_STARTED":
        this.state.positionMap = new PositionMap()
        this.state.tilesByPosition = new Map()
        for (const tile of event.tiles) {
          this.state.positionMap.add(tile.position)
          this.state.tilesByPosition.set(tile.position, tile.card)
        }
        break
      case "PAIR_REMOVED":
        for (const pos of event.positions) {
          this.state.positionMap.remove(pos)
          this.state.tilesByPosition.delete(pos)
        }
        break
    }
  }

  onEvent(handler: (event: GameEvent) => void): () => void {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler)
    }
  }

  private notifyEventHandlers(event: GameEvent): void {
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  }
}
