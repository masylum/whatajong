import {
  getSuit,
  getNumber,
  type Dragons,
  type Seasons,
  type Flowers,
  isDragon,
  isFlower,
  isSeason,
  type Card,
  getPoints,
  isJoker,
} from "./deck"
import { Database } from "./in-memoriam"
import type { Tile } from "./tile"

export type Powerup = {
  id: string
  playerId: string
  combo: number
  card: Dragons | Flowers | Seasons
}
export type PowerupById = Record<string, Powerup>
export const powerupIndexes = ["playerId"] as const
export type PowerupIndexes = (typeof powerupIndexes)[number]
export type PowerupDb = Database<Powerup, PowerupIndexes>

const DRAGON_SUIT = { c: "c", f: "b", p: "o" } as const

export function initPowerupsDb(powerups: PowerupById): PowerupDb {
  const powerupsDb = new Database<Powerup, PowerupIndexes>({
    indexes: powerupIndexes,
  })

  for (const powerup of Object.values(powerups)) {
    powerupsDb.set(powerup.id, powerup)
  }

  return powerupsDb
}

export function getJokerPowerup(powerupsDb: PowerupDb, playerId: string) {
  return powerupsDb
    .filterBy({ playerId })
    .find((p) => isFlower(p.card) || isSeason(p.card))
}

function matchesSuit(powerup: Powerup, card: Card) {
  const dragon = getNumber(powerup.card) as keyof typeof DRAGON_SUIT
  const targetSuit = DRAGON_SUIT[dragon]

  return targetSuit === getSuit(card) || isFlower(card) || isSeason(card)
}

export function getComboPowerup(
  powerupsDb: PowerupDb,
  playerId: string,
  tile: Tile,
) {
  const dragonPowerup = powerupsDb
    .filterBy({ playerId })
    .find((p) => isDragon(p.card))
  if (!dragonPowerup) return null

  if (matchesSuit(dragonPowerup, tile.card)) {
    return dragonPowerup
  }

  return null
}

export function getPowerups(
  powerupsDb: PowerupDb,
  playerId: string,
  tile: Tile,
) {
  const dragonPowerup = powerupsDb
    .filterBy({ playerId })
    .find((p) => isDragon(p.card))
  const jokerPowerup = getJokerPowerup(powerupsDb, playerId)
  const newCard = tile.card
  const dragonCard = isDragon(newCard)
  const jokerCard = isJoker(newCard)

  function removeAllPowerups() {
    const powerups = powerupsDb.filterBy({ playerId })
    for (const powerup of powerups) {
      powerupsDb.del(powerup.id)
    }
  }

  if (dragonCard) {
    removeAllPowerups()
    const id = `${playerId}-dragon`
    powerupsDb.set(id, { id, playerId, card: dragonCard, combo: 0 })
    return
  }

  if (jokerCard) {
    const id = `${playerId}-joker`
    if (dragonPowerup) {
      powerupsDb.set(dragonPowerup.id, {
        ...dragonPowerup,
        combo: dragonPowerup.combo + 1,
      })
      powerupsDb.set(id, { id, playerId, card: jokerCard, combo: 0 })
    } else {
      removeAllPowerups()
      powerupsDb.set(id, { id, playerId, card: jokerCard, combo: 0 })
    }
    return
  }

  if (dragonPowerup) {
    if (matchesSuit(dragonPowerup, newCard)) {
      powerupsDb.set(dragonPowerup.id, {
        ...dragonPowerup,
        combo: dragonPowerup.combo + 1,
      })

      if (jokerPowerup) {
        powerupsDb.del(jokerPowerup.id)
      }
    } else {
      removeAllPowerups()
    }
  } else if (jokerPowerup) {
    removeAllPowerups()
  }
}

export function getComboMultiplier(combo: number) {
  if (combo === 0) return 1
  return Math.round(1.6 ** combo)
}

export function getPointsWithCombo(
  powerupsDb: PowerupDb,
  playerId: string,
  tile: Tile,
) {
  const points = getPoints(tile.card)
  const powerup = getComboPowerup(powerupsDb, playerId, tile)
  if (!powerup) return points

  return points * getComboMultiplier(powerup.combo)
}
