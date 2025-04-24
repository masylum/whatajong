import type { Game } from "@/lib/game"
import Rand from "rand-seed"
import {
  type ParentProps,
  createContext,
  createMemo,
  useContext,
} from "solid-js"
import { calculateSeconds } from "./gameState"
import { createPersistantMutable } from "./persistantMutable"
import type { TileItem } from "./shopState"

const RUN_STATE_NAMESPACE = "run-state-v3"
export const TUTORIAL_SEED = "tutorial-seed"
export const REWARDS = {
  2: "winds",
  3: "dragons",
  4: "rabbits",
  5: "flowers",
  6: "phoenixes",
  7: "mutations",
  8: "jokers",
  9: "kudos",
  10: "honors",
  11: "astronomer",
} as const

export type RunState = {
  runId: string
  money: number
  round: number
  stage: RoundStage
  items: TileItem[]
  difficulty?: Difficulty
  createdAt: number
  freeze?: {
    round: number
    reroll: number
    active: boolean
  }
}

export type Difficulty = "easy" | "medium" | "hard"
type RoundStage = "intro" | "select" | "game" | "shop" | "gameOver" | "reward"
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

  return createMemo(() => generateRound(run.round, run))
}

export function fetchRuns() {
  return Object.entries(localStorage)
    .filter(([key]) => key.startsWith(RUN_STATE_NAMESPACE))
    .map(([_, value]) => JSON.parse(value))
    .sort((a, b) => b.createdAt - a.createdAt)
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
        reward: 1,
        stage: "intro",
        createdAt: Date.now(),
        items: [],
      }
    },
  })
}

const DIFFICULTY = {
  easy: {
    timer: { exp: 1.2, lin: 0.5 },
    point: { initial: 40, exp: 2.2, lin: 20 },
  },
  medium: {
    timer: { exp: 1.3, lin: 1 },
    point: { initial: 50, exp: 2.4, lin: 30 },
  },
  hard: {
    timer: { exp: 1.4, lin: 2 },
    point: { initial: 60, exp: 2.6, lin: 60 },
  },
} as const

export function generateRound(id: number, run: RunState): Round {
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
  const timerPoints = ((level * timer.lin + timer.exp ** level) / 20) * var1 // Grows level + 1.3^level
  const pointObjective = Math.round(
    (point.initial + level * point.lin + level ** point.exp) * var2,
  ) // Grows 30*level + level^2.8

  const round: Round = {
    id,
    timerPoints,
    pointObjective,
  }

  return round
}

function totalPoints(game: Game, round: Round) {
  const time = calculateSeconds(game)
  const penalty = Math.floor(time * round.timerPoints)
  return game.points - penalty
}

export function runGameWin(game: Game, run: RunState) {
  const round = generateRound(run.round, run)
  if (game.endCondition !== "empty-board") return false
  const enoughPoints = totalPoints(game, round) >= round.pointObjective
  if (!enoughPoints) return false

  return true
}

export function calculateIncome(run: RunState) {
  return run.round * 3
}
