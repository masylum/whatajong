import { getRunPairs, type Card } from "@repo/game/deck"
import { Value } from "@repo/game/in-memoriam"
import type { MapName } from "@repo/game/map"
import { customRandom, urlAlphabet } from "nanoid"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { createContext, useContext, type ParentProps } from "solid-js"

const RUN_STATE_NAMESPACE = "run-state"
const RunStateContext = createContext<Value<RunState> | undefined>()

export type RunState = {
  runId: string
  currentGameId: string
  money: number
  deck: [Card, Card][]
  map: MapName
  round: number
  initialPoints: number
  timerSpeed: number
  shufflesAvailable: number
  incomeMultiplier: number
  packLuck: number
}

export type ChallengeType = "points" | "suddenDeath"
export type RunGameSettings = {
  challengeType: ChallengeType
  gameId: string
  pointObjective?: number
  timerPoints?: number
  noDragons?: boolean
  noWinds?: boolean
  noFlowers?: boolean
  noSeasons?: boolean
}

export function RunStateProvider(
  props: { run: Value<RunState> } & ParentProps,
) {
  return (
    <RunStateContext.Provider value={props.run}>
      {props.children}
    </RunStateContext.Provider>
  )
}

export function useRunState() {
  const context = useContext(RunStateContext)

  if (!context) {
    throw new Error("can't find RunStateContext")
  }

  return context
}

function key(runId: string) {
  return `${RUN_STATE_NAMESPACE}-${runId}`
}

export function saveRunState(runState: RunState) {
  localStorage.setItem(key(runState.runId), JSON.stringify(runState))
}

export function initRunState(runId: string): Value<RunState> {
  const runState = localStorage.getItem(key(runId))

  if (runState) {
    return new Value(JSON.parse(runState))
  }

  return new Value({
    runId,
    currentGameId: nanoid(),
    money: 0,
    deck: getRunPairs(),
    map: "map54" as MapName,
    round: 0,
    initialPoints: 150,
    timerSpeed: 0,
    shufflesAvailable: 1,
    incomeMultiplier: 1,
    packLuck: 0.1,
  })
}

export function generateRounds(round: number, seed: string): RunGameSettings {
  const rng = new Rand(`${seed}${round}`)
  const difficultyFactor = 1 + round * 0.1
  const challengeType = rng.next() > 0.7 ? "suddenDeath" : "points"
  const gameId = customRandom(urlAlphabet, 10, (size) =>
    new Uint8Array(size).map(() => 256 * rng.next()),
  )

  const settings: RunGameSettings = {
    challengeType,
    gameId: gameId(),
    timerPoints: Math.ceil(1 + difficultyFactor * 0.5),
  }

  if (challengeType === "points") {
    const baseObjective = 100 + round * 20
    settings.pointObjective = Math.ceil(baseObjective * difficultyFactor)
  } else {
    const baseObjective = round * 10
    settings.pointObjective = Math.ceil(baseObjective * difficultyFactor)
  }

  // boss round
  if (round % 3 === 0) {
    const restrictionCount = Math.floor(rng.next() * 2)

    for (let i = 0; i < restrictionCount; i++) {
      const restriction = Math.floor(rng.next() * 4)
      if (restriction === 0) settings.noDragons = true
      if (restriction === 1) settings.noWinds = true
      if (restriction === 2) settings.noFlowers = true
      if (restriction === 3) settings.noSeasons = true
    }
  }

  return settings
}
