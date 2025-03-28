import Rand from "rand-seed"
import {
  createContext,
  createMemo,
  useContext,
  type ParentProps,
} from "solid-js"
import { generateShopItems, type Item } from "./shopState"
import { createPersistantMutable } from "./persistantMutable"
import type { Deck, Level } from "@/lib/game"

const RUN_STATE_NAMESPACE = "run-state"

export type RunState = {
  runId: string
  money: number
  round: number
  stage: RoundStage
  shopLevel: Level
  shopItems: Item[]
  items: Item[]
  difficulty?: Difficulty
  freeze?: {
    round: number
    reroll: number
    active: boolean
  }
}

export type Difficulty = "easy" | "medium" | "hard"
export type RoundStage = "intro" | "select" | "game" | "shop"
export type Round = {
  id: number
  pointObjective: number
  timerPoints: number
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

  return createMemo(() => generateRound(run))
}

type CreateRunStateParams = { id: () => string }
export function createRunState(params: CreateRunStateParams) {
  return createPersistantMutable<RunState>({
    namespace: RUN_STATE_NAMESPACE,
    id: params.id,
    init: () => {
      return {
        runId: params.id(),
        money: 0,
        round: 1,
        stage: "intro",
        shopLevel: 1,
        shopItems: generateShopItems(),
        items: [],
      }
    },
  })
}

const DIFFICULTY = {
  easy: {
    timer: { exp: 1.2, lin: 0.5 },
    point: { exp: 2.4, lin: 20 },
  },
  medium: {
    timer: { exp: 1.3, lin: 1 },
    point: { exp: 2.8, lin: 30 },
  },
  hard: {
    timer: { exp: 1.4, lin: 2 },
    point: { exp: 3, lin: 60 },
  },
} as const

export function generateRound(run: RunState): Round {
  const id = run.round
  const runId = run.runId
  const rng = new Rand(`round-${runId}-${id}`)
  const { timer, point } = DIFFICULTY[run.difficulty!]

  function variation() {
    const rand = rng.next()
    return 1 + (rand * 2 - 1) * 0.2
  }

  const var1 = variation()
  const var2 = variation()
  const level = id - 1
  const timerPoints =
    level === 0 ? 0 : ((level * timer.lin + timer.exp ** level) / 20) * var1 // Grows level + 1.3^level
  const pointObjective = Math.round(
    (110 + level * point.lin + level ** point.exp) * var2,
  ) // Grows 30*level + level^2.8

  const round: Round = {
    id,
    timerPoints,
    pointObjective,
  }

  return round
}

export function shopUpgradeCost(run: RunState) {
  return run.shopLevel * 100
}

export const DECK_CAPACITY_PER_LEVEL = {
  1: 36,
  2: 42,
  3: 52,
  4: 64,
  5: 77,
} as const

export function getIncome(deck: Deck, run: RunState) {
  return deck.size * run.shopLevel
}
