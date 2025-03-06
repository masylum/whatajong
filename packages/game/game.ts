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
  type DeckTile,
} from "./deck"
import { deleteTiles, isFree } from "./tile"
import { getPointsWithCombo, getPowerups, type PowerupDb } from "./powerups"
import type { Tile } from "./tile"
import type { TileDb } from "./tile"
import { isMultiplayer, type PlayerDb } from "./player"
import type { Selection } from "./selection"
import { resolveWinds } from "./winds"
import type { State } from "./types"
import { setupTiles } from "./setupTiles"
import type Rand from "rand-seed"
import type { MapName } from "./map"
import { batch } from "solid-js"

export const WIN_CONDITIONS = ["empty-board", "no-pairs"] as const
export type WinCondition = (typeof WIN_CONDITIONS)[number]

export type Game = {
  startedAt?: number
  endedAt?: number
  endCondition?: WinCondition
  map: MapName
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

export function selectTile(db: State, selection: Selection) {
  batch(() => {
    const playerId = selection.playerId
    const player = db.players.get(playerId)
    if (!player) throw new Error("Player not found")

    const tile = db.tiles.get(selection.tileId)
    if (!tile) throw new Error("Tile not found")

    if (!isFree(db.tiles, tile, db.powerups, playerId)) {
      db.selections.del(selection.id)
      return
    }

    const firstSelection = db.selections.findBy({ playerId })
    if (!firstSelection) {
      db.selections.set(selection.id, selection)
      return
    }

    if (firstSelection.id === selection.id) {
      db.selections.del(selection.id)
      return
    }

    const firstTile = db.tiles.get(firstSelection.tileId)
    if (!firstTile) {
      throw new Error("First tile not found")
    }

    db.selections.del(firstSelection.id)

    if (cardsMatch(firstTile.card, tile.card)) {
      deleteTiles(db.tiles, db.selections, [tile, firstTile], playerId)
      resolveWinds(db.tiles, db.powerups, tile)
      getPowerups(db.powerups, playerId, tile)

      const points =
        player.points + getPointsWithCombo(db.powerups, playerId, tile)
      db.players.set(playerId, { ...player, points })
    }

    for (const player of db.players.all) {
      const condition = gameOverCondition(db.tiles, db.powerups, player.id)

      if (condition) {
        db.game.set({
          endedAt: new Date().getTime(),
          endCondition: condition,
        })
        return
      }
    }
  })
}

export function restartGame({
  db,
  rng,
  mapName,
  initialPoints,
  deck,
}: {
  db: State
  rng: Rand
  mapName: MapName
  initialPoints: number
  deck: DeckTile[]
}) {
  batch(() => {
    db.game.set({
      startedAt: new Date().getTime(),
      // TODO: rename
      map: mapName,
    })

    const newTiles = setupTiles({ rng, mapName, deck })
    for (const tile of Object.values(newTiles)) {
      db.tiles.set(tile.id, tile)
    }

    for (const player of db.players.all) {
      db.players.set(player.id, {
        ...player,
        points: initialPoints || 0,
      })
    }
    db.selections.update({})
    db.powerups.update({})
  })
}
