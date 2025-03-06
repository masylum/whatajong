import { Value } from "@repo/game/in-memoriam"
import type { MapName } from "@repo/game/map"
import Rand from "rand-seed"
import {
  createContext,
  createEffect,
  createMemo,
  on,
  useContext,
  type ParentProps,
} from "solid-js"
import type { Item } from "./itemState"
const RUN_STATE_NAMESPACE = "run-state"

export type RunState = {
  runId: string
  money: number
  // TODO: rename to mapName
  map: MapName
  round: number
  reroll: number
  // TODO: rename to stage
  roundStage: RoundStage
  initialPoints: number
  timerSpeed: number
  shufflesAvailable: number
  incomeMultiplier: number
  packLuck: number
  currentItem: Item | null
}

export type RoundStage = "select" | "game" | "shop"
export type ChallengeType = "points" | "suddenDeath"
export type Round = {
  id: number
  reward: number
  challengeType: ChallengeType
  pointObjective: number
  timerPoints?: number
  noDragons?: boolean
  noWinds?: boolean
  noFlowers?: boolean
  noSeasons?: boolean
}

const RunStateContext = createContext<Value<RunState> | undefined>()

// TODO: deprecate?
export function RunStateProvider(
  props: { run: Value<RunState> } & ParentProps,
) {
  return (
    <RunStateContext.Provider value={props.run}>
      {props.children}
    </RunStateContext.Provider>
  )
}

// TODO: deprecate?
export function useRunState() {
  const context = useContext(RunStateContext)

  if (!context) {
    throw new Error("can't find RunStateContext")
  }

  return context
}

export function useRound() {
  const run = useRunState()
  const round = createMemo(() =>
    generateRound(run.get().round, run.get().runId),
  )
  return round
}

function key(runId: string) {
  return `${RUN_STATE_NAMESPACE}-${runId}`
}

export function createRunState(runId: () => string) {
  const run = createMemo(
    () =>
      new Value<RunState>({
        runId: runId(),
        money: 0,
        map: "map68",
        round: 1,
        reroll: 0,
        roundStage: "select",
        initialPoints: 150,
        timerSpeed: 0,
        shufflesAvailable: 1,
        incomeMultiplier: 1,
        packLuck: 0.1,
        currentItem: null,
      }),
  )

  createEffect(
    on(runId, (id) => {
      const persistedState = localStorage.getItem(key(id))
      if (persistedState) {
        run().set(JSON.parse(persistedState))
      }
    }),
  )

  createEffect(() => {
    localStorage.setItem(key(runId()), JSON.stringify(run().get()))
  })

  return run
}

function generateChallengeType(id: number, rng: Rand) {
  const rand = rng.next()
  if (id < 3) return "points"
  if (rand > 0.7) return "suddenDeath"
  // TODO: boss round

  return "points"
}

export function generateRound(id: number, runId: string): Round {
  const rng = new Rand(`round-${runId}-${id}`)
  const difficultyFactor = 1 + id * 0.1
  const challengeType = generateChallengeType(id, rng)
  const reward = Math.floor(5 + id * rng.next())

  const round: Round = {
    id,
    reward,
    challengeType,
    timerPoints: Math.ceil(1 + difficultyFactor * 0.5),
    pointObjective: 0,
  }

  if (challengeType === "points") {
    const baseObjective = 100 + id * 20
    round.pointObjective = Math.ceil(baseObjective * difficultyFactor)
  } else {
    const baseObjective = id * 10
    round.pointObjective = Math.ceil(baseObjective * difficultyFactor)
  }

  // boss round
  if (id % 3 === 0) {
    const restrictionCount = Math.floor(rng.next() * 2)

    for (let i = 0; i < restrictionCount; i++) {
      const restriction = Math.floor(rng.next() * 4)
      if (restriction === 0) round.noDragons = true
      if (restriction === 1) round.noWinds = true
      if (restriction === 2) round.noFlowers = true
      if (restriction === 3) round.noSeasons = true
    }
  }

  return round
}
