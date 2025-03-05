import type { Card } from "./deck"
import type { MapName } from "./map"
import { getStandardPairs } from "./deck"

export interface Settings {
  map: MapName
  initialPoints: number
  deck: [Card, Card][]
}

export function getDefaultSoloSettings(): Settings {
  return {
    map: "default",
    initialPoints: 0,
    deck: getStandardPairs(),
  }
}

export function getDefaultDuelSettings(): Settings {
  return getDefaultSoloSettings()
}
