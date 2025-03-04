import type { Selection } from "@repo/game/selection"

export interface GameController {
  selectTile: (selection: Selection) => void
  restartGame: () => void
  getWebSocket: () => WebSocket | null
}
