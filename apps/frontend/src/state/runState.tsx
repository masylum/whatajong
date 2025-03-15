import Rand from "rand-seed"
import {
  createContext,
  createMemo,
  useContext,
  type ParentProps,
} from "solid-js"
import { generateEmperorItems, type Item } from "./shopState"
import { createPersistantMutable } from "./persistantMutable"
import { shuffle } from "@/lib/rand"

const RUN_STATE_NAMESPACE = "run-state"

export type RunState = {
  runId: string
  money: number
  round: number
  stage: RoundStage
  shopLevel: number
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

const RunStateContext = createContext<RunState | undefined>()

export function RunStateProvider(props: { run: RunState } & ParentProps) {
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

  return createMemo(() => generateRound(run.round, run.runId))
}

type CreateRunStateParams = { id: () => string }
export function createRunState(params: CreateRunStateParams) {
  const rng = new Rand(`run-${params.id()}`)
  const initialEmperor = shuffle(generateEmperorItems(), rng).filter(
    (emperor) => emperor.level === 1,
  )[0]!

  return createPersistantMutable<RunState>({
    namespace: RUN_STATE_NAMESPACE,
    id: params.id,
    init: () => ({
      runId: params.id(),
      money: 0,
      round: 1,
      stage: "select",
      shopLevel: 1,
      items: [initialEmperor],
    }),
  })
}

export function generateRound(id: number, runId: string): Round {
  const rng = new Rand(`round-${runId}-${id}`)

  function variation() {
    const rand = rng.next()
    return 1 + (rand * 2 - 1) * 0.2
  }

  const reward = 28 + id * 2
  const timerPoints = (1.2 ** id / 40) * variation() // Grows 1.3^level
  const pointObjective = Math.round(110 + (id - 1) ** 3 * variation()) // Grows level^3 and has a 15% random variation
  const emptyBoardBonus = Math.round((id ** 3 / 3) * variation()) // Grows level^3 and has a 15% random variation

  const round: Round = {
    id,
    reward,
    timerPoints,
    pointObjective,
    emptyBoardBonus,
  }

  return round
}

export function shopUpgradeCost(run: RunState) {
  return 4 + run.shopLevel
}

export const PASSIVE_INCOME_MULTIPLIER = 0.05
export function calculatePassiveIncome(run: RunState) {
  return Math.floor(run.money * passiveIncome(run))
}

export function passiveIncome(run: RunState) {
  return (run.shopLevel - 1) * PASSIVE_INCOME_MULTIPLIER
}
