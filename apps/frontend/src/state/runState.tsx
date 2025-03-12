import { Value } from "@repo/game/in-memoriam"
import Rand from "rand-seed"
import {
  createContext,
  createEffect,
  createMemo,
  on,
  useContext,
  type ParentProps,
} from "solid-js"
import type { Item } from "./shopState"
import type { DeckSizeLevel } from "@repo/game/deck"

const RUN_STATE_NAMESPACE = "run-state"

export type RunState = {
  runId: string
  money: number
  round: number
  stage: RoundStage
  shopLevel: DeckSizeLevel
  items: Item[]
}

export type RoundStage = "select" | "game" | "shop"
export type Round = {
  id: number
  reward: number
  pointObjective: number
  timerPoints: number
  emptyBoardBonus: number
}

const RunStateContext = createContext<Value<RunState> | undefined>()

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
        round: 1,
        stage: "select",
        shopLevel: 1,
        items: [],
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

export function generateRound(id: number, runId: string): Round {
  const rng = new Rand(`round-${runId}-${id}`)
  const reward = 3 + id

  const rand = rng.next()
  const timerPoints = Math.round((rand * id) / 5)
  const pointObjective = 90 + (id - 1) ** 3

  const round: Round = {
    id,
    reward,
    timerPoints,
    pointObjective,
    emptyBoardBonus: Math.round(30 * id * rand),
  }

  return round
}

export function shopUpgradeCost(run: RunState) {
  return 4 + run.shopLevel
}
