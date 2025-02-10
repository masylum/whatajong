import { json } from "@solidjs/router"
import {
  initializeGame,
  removePair,
  getTiles,
  type GameState,
} from "~/gameState"
import type { Position } from "~/types"
import { createEventStore, type GameEvent, type EventStore } from "~/events"

// Store active games and their event stores
const activeGames = new Map<string, { state: GameState; store: EventStore }>()

// Helper to generate a game ID
function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Create a new game
export function createGame() {
  const gameId = generateGameId()
  const gameState = initializeGame()
  const eventStore = createEventStore()

  const startEvent: GameEvent = {
    type: "GAME_STARTED",
    gameId,
    timestamp: Date.now(),
    tiles: getTiles(gameState).map(({ card, position }) => ({
      card,
      position,
    })),
  }

  eventStore.events.push(startEvent)
  activeGames.set(gameId, { state: gameState, store: eventStore })

  return json({
    gameId,
    tiles: getTiles(gameState),
    events: [startEvent],
    version: 1,
  })
}

// Get events for a game
export function getGameEvents({
  params,
  request,
}: { params: { id: string }; request: Request }) {
  const game = activeGames.get(params.id)
  if (!game) {
    return json({ success: false, error: "Game not found" }, { status: 404 })
  }

  const url = new URL(request.url)
  const since = Number.parseInt(url.searchParams.get("since") || "0")

  return json({
    success: true,
    events: game.store.events.slice(since),
    version: game.store.version,
  })
}

export interface RemovePairRequest {
  gameId: string
  positions: [Position, Position]
  clientVersion: number // Client's current event version
}

export interface RemovePairResponse {
  success: boolean
  tiles?: ReturnType<typeof getTiles>
  events?: GameEvent[]
  version?: number
  error?: string
}

// POST /api/game - Handle pair removal
export async function POST({ request }: { request: Request }) {
  const body = (await request.json()) as RemovePairRequest
  const {
    gameId,
    positions: [pos1, pos2],
    clientVersion,
  } = body

  const game = activeGames.get(gameId)
  if (!game) {
    return json<RemovePairResponse>(
      {
        success: false,
        error: "Game not found",
      },
      { status: 404 },
    )
  }

  // Check if client is behind
  if (clientVersion < game.store.version) {
    return json<RemovePairResponse>({
      success: false,
      error: "Client out of sync",
      events: game.store.events.slice(clientVersion),
      version: game.store.version,
    })
  }

  const success = removePair(game.state, pos1, pos2)
  if (!success) {
    return json<RemovePairResponse>(
      {
        success: false,
        error: "Invalid move",
      },
      { status: 400 },
    )
  }

  // Create and store the event
  const removeEvent: GameEvent = {
    type: "PAIR_REMOVED",
    gameId,
    timestamp: Date.now(),
    positions: [pos1, pos2],
  }

  game.store.events.push(removeEvent)
  game.store.version++

  // Check if game is completed
  if (getTiles(game.state).length === 0) {
    const completeEvent: GameEvent = {
      type: "GAME_COMPLETED",
      gameId,
      timestamp: Date.now(),
    }
    game.store.events.push(completeEvent)
    game.store.version++
    activeGames.delete(gameId)

    return json<RemovePairResponse>({
      success: true,
      tiles: [],
      events: [removeEvent, completeEvent],
      version: game.store.version,
    })
  }

  return json<RemovePairResponse>({
    success: true,
    tiles: getTiles(game.state),
    events: [removeEvent],
    version: game.store.version,
  })
}

interface GameStateResponse {
  success: boolean
  tiles?: ReturnType<typeof getTiles>
  error?: string
  events?: GameEvent[]
  version?: number
}

// GET /api/game/:id - Get or create game state
export function GET({ params }: { params: { id: string } }) {
  let game = activeGames.get(params.id)

  // Create new game if it doesn't exist
  if (!game) {
    const gameState = initializeGame()
    console.log(gameState)
    const eventStore = createEventStore()

    const startEvent: GameEvent = {
      type: "GAME_STARTED",
      gameId: params.id,
      timestamp: Date.now(),
      tiles: getTiles(gameState).map(({ card, position }) => ({
        card,
        position,
      })),
    }

    eventStore.events.push(startEvent)
    game = { state: gameState, store: eventStore }
    activeGames.set(params.id, game)
  }

  return json<GameStateResponse>({
    success: true,
    tiles: getTiles(game.state),
    events: game.store.events,
    version: game.store.version,
  })
}
