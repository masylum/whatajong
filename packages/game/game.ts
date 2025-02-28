import {
  cardsMatch,
  isSeason,
  isDragon,
  isFlower,
  type Card,
  isWind,
  isCircle,
  isCharacter,
  isBamboo,
} from "./deck"
import { isFree } from "./tile"
import type { PowerupDb } from "./powerups"
import type { Tile } from "./tile"
import type { TileDb } from "./tile"
import { isMultiplayer, type PlayerDb } from "./player"

export const WIN_CONDITIONS = ["empty-board", "no-pairs"] as const
export type WinCondition = (typeof WIN_CONDITIONS)[number]

export type Game = {
  startedAt?: number
  endedAt?: number
  endCondition?: WinCondition
}

export function gameOverCondition(
  tileDb: TileDb,
  powerupsDb: PowerupDb,
  playerId: string,
) {
  const tilesAlive = tileDb.all.filter((tile) => !tile.deletedBy)
  if (tilesAlive.length === 0) {
    return "empty-board"
  }

  const availablePairs = getAvailablePairs(tileDb, powerupsDb, playerId)
  if (availablePairs.length === 0) {
    return "no-pairs"
  }

  return null
}

export function didPlayerWin(game: Game, playerDb: PlayerDb, playerId: string) {
  if (!isMultiplayer(playerDb)) {
    return game.endCondition === "empty-board"
  }

  const playerPoints = playerDb.byId[playerId]!.points
  const otherPlayers = playerDb.all.filter((player) => player.id !== playerId)

  for (const otherPlayer of otherPlayers) {
    if (otherPlayer.points > playerPoints) return false
  }

  return true
}

export function getAvailablePairs(
  tileDb: TileDb,
  powerupsDb?: PowerupDb,
  playerId?: string,
): [Tile, Tile][] {
  const freeTiles = getFreeTiles(tileDb, powerupsDb, playerId)
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      const tile1 = freeTiles[i]!
      const tile2 = freeTiles[j]!
      if (!cardsMatch(tile1.card, tile2.card)) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
}

export function getPoints(card: Card) {
  if (isDragon(card)) return 4
  if (isFlower(card)) return 8
  if (isSeason(card)) return 8
  if (isWind(card)) return 16
  if (isBamboo(card)) return 1
  if (isCharacter(card)) return 2
  if (isCircle(card)) return 3

  return 0
}

export function calculatePoints(tiles: Tile[]) {
  let points = 0

  for (const tile of tiles) {
    points += getPoints(tile.card)
  }

  return points
}

export function getFreeTiles(
  tileDb: TileDb,
  powerupsDb?: PowerupDb,
  playerId?: string,
): Tile[] {
  return tileDb.all.filter(
    (tile) => !tile.deletedBy && isFree(tileDb, tile, powerupsDb, playerId),
  )
}
