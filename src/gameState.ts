import { type Card, getDeck } from "./deck"
import type { Position } from "./types"
import {
  getMap,
  PositionMap,
  isFree,
  hasSupport,
  canLeaveHorizontalGap,
} from "./map"

export interface Tile {
  card: Card
  position: Position
}

export interface GameState {
  positionMap: PositionMap
  tilesByPosition: Map<Position, Card>
  remainingPairs: [Card, Card][]
  players: {
    player1: Player
    player2: Player
  }
}

interface Player {
  name: string
  tiles: Tile[]
}

// Helper to get all tiles from position map
export function getTiles(gameState: GameState): Tile[] {
  return Array.from(gameState.tilesByPosition.entries()).map(([pos, card]) => ({
    position: pos,
    card: card,
  }))
}

export function initializeGame(): GameState {
  const gameState: GameState = {
    positionMap: new PositionMap(),
    tilesByPosition: new Map<Position, Card>(),
    remainingPairs: [], // We'll fill this differently
    players: {
      player1: { name: "Player 1", tiles: [] },
      player2: { name: "Player 2", tiles: [] },
    },
  }

  // First, get all valid positions from the map layout
  const mapLayout = getMap()

  // Get all valid positions from the map
  for (let z = 0; z < mapLayout.length; z++) {
    for (let y = 0; y < mapLayout[z].length; y++) {
      for (let x = 0; x < mapLayout[z][y].length; x++) {
        if (
          mapLayout[z][y][x] !== null &&
          (y === 0 || mapLayout[z][y][x] !== mapLayout[z][y - 1][x])
        ) {
          const pos = { x, y, z }
          gameState.positionMap.add(pos)
          gameState.tilesByPosition.set(pos, "d1") // Dummy tile
          x++ // Skip the next position as it's part of the same tile
        }
      }
    }
  }

  // Array to store the order in which tiles were removed
  const pickOrder: Position[] = []

  // Keep removing pairs until we can't anymore
  while (true) {
    const freeTiles = getFreeTiles(gameState)
    if (freeTiles.length <= 1) break

    // Randomly select two free tiles
    const idx1 = Math.floor(Math.random() * freeTiles.length)
    const tile1 = freeTiles[idx1]
    freeTiles.splice(idx1, 1)

    const idx2 = Math.floor(Math.random() * freeTiles.length)
    const tile2 = freeTiles[idx2]

    // Remove the pair and store their positions
    removePair(gameState, tile1.position, tile2.position)
    pickOrder.push(tile1.position, tile2.position)
  }

  // If we couldn't remove all tiles, start over
  if (gameState.positionMap.size > 0) {
    return initializeGame()
  }

  // Get all possible card pairs
  const allPairs = getDeck()
  console.log("All pairs", allPairs)

  // Place tiles back in reverse order with actual cards
  for (let i = 0; i < pickOrder.length; i += 2) {
    const pos1 = pickOrder[pickOrder.length - 1 - i]
    const pos2 = pickOrder[pickOrder.length - 2 - i]
    const [card1, card2] = allPairs[i / 2]

    gameState.positionMap.add(pos1)
    gameState.positionMap.add(pos2)
    gameState.tilesByPosition.set(pos1, card1)
    gameState.tilesByPosition.set(pos2, card2)
  }

  return gameState
}

export function canRemovePair(
  gameState: GameState,
  pos1: Position,
  pos2: Position,
): boolean {
  // Check if both positions exist and are valid for removal
  if (!gameState.positionMap.has(pos1) || !gameState.positionMap.has(pos2)) {
    return false
  }

  // Check if both positions are valid for removal
  return (
    isFree(pos1, gameState.positionMap) && isFree(pos2, gameState.positionMap)
  )
}

// TODO: remove from here, this is stateful
export function removePair(
  gameState: GameState,
  pos1: Position,
  pos2: Position,
): boolean {
  if (!canRemovePair(gameState, pos1, pos2)) return false

  // Remove positions from map
  gameState.positionMap.remove(pos1)
  gameState.positionMap.remove(pos2)
  gameState.tilesByPosition.delete(pos1)
  gameState.tilesByPosition.delete(pos2)

  return true
}

export function getFreeTiles(gameState: GameState): Tile[] {
  return Array.from(gameState.tilesByPosition.entries())
    .filter(([pos]) => isFree(pos, gameState.positionMap))
    .map(([pos, card]) => ({
      position: pos,
      card: card,
    }))
}

export function getAvailablePairs(gameState: GameState): [Tile, Tile][] {
  const freeTiles = getFreeTiles(gameState)
  const pairs: [Tile, Tile][] = []

  // Check each free tile against other free tiles to find matching pairs
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (freeTiles[i].card === freeTiles[j].card) {
        pairs.push([freeTiles[i], freeTiles[j]])
      }
    }
  }

  return pairs
}
