import {
  type Card,
  bams,
  brushes,
  cracks,
  dots,
  dragons,
  elements,
  flowers,
  gems,
  jokers,
  lotuses,
  mutations,
  phoenixes,
  sparrows,
  taijitu,
  winds,
} from "@/lib/game"
import { frogs } from "@/lib/game"
import { rabbits } from "@/lib/game"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import {
  type Accessor,
  type ParentProps,
  createContext,
  createMemo,
  useContext,
} from "solid-js"
import { createPersistantMutable } from "./persistantMutable"
import type { TileItem } from "./shopState"

const RUN_STATE_NAMESPACE = "run-state-v3"
export const TUTORIAL_SEED = "tutorial-seed"
const ITEM_COST = 3
const ITEM_POOL_SIZE = 9

export type RunState = {
  runId: string
  money: number
  round: number
  stage: RoundStage
  items: TileItem[]
  difficulty: Difficulty
  createdAt: number
  retries: number
  attempts: number
  totalPoints: number
  freeze?: {
    round: number
    reroll: number
    active: boolean
  }
}

export type Difficulty = "easy" | "medium" | "hard"
type RoundStage = "intro" | "game" | "shop" | "gameOver" | "reward"
type Round = {
  id: number
  pointObjective: number
  timerPoints: number
}
type Level = {
  level: number
  tileItems: TileItem[]
  rewards: number
}
export type Levels = Level[]

const RunStateContext = createContext<RunState | undefined>()
const RoundContext = createContext<Accessor<Round> | undefined>()
const LevelsContext = createContext<Accessor<Levels> | undefined>()

export function RunStateProvider(props: { run: RunState } & ParentProps) {
  const levels = createMemo(() => getLevels(props.run.runId))
  const round = createMemo(() => generateRound(props.run.round, props.run))

  return (
    <RunStateContext.Provider value={props.run}>
      <RoundContext.Provider value={round}>
        <LevelsContext.Provider value={levels}>
          {props.children}
        </LevelsContext.Provider>
      </RoundContext.Provider>
    </RunStateContext.Provider>
  )
}

export function useRunState() {
  const context = useContext(RunStateContext)
  if (!context) throw new Error("can't find RunStateContext")

  return context
}

export function useRound() {
  const context = useContext(RoundContext)
  if (!context) throw new Error("can't find RoundContext")

  return context
}

export function useLevels() {
  const context = useContext(LevelsContext)
  if (!context) throw new Error("can't find LevelsContext")

  return context
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
    init: () => initialRunState(params.id()),
  })
}

export function initialRunState(id: string): RunState {
  let difficulty: Difficulty

  if (id === TUTORIAL_SEED) {
    difficulty = "easy"
  } else {
    const letter = id[0]!
    difficulty =
      (
        {
          E: "easy",
          M: "medium",
          H: "hard",
        } as const
      )[letter] ?? "easy"
  }

  return {
    runId: id,
    money: 0,
    round: 1,
    stage: id === TUTORIAL_SEED ? "intro" : "game",
    retries: 0,
    attempts: 0,
    difficulty,
    totalPoints: 0,
    createdAt: Date.now(),
    items: [],
  }
}

const DIFFICULTY = {
  easy: {
    timer: { exp: 1.1, lin: 1 },
    point: { initial: 40, exp: 2, lin: 5 },
  },
  medium: {
    timer: { exp: 1.15, lin: 2 },
    point: { initial: 40, exp: 2.1, lin: 10 },
  },
  hard: {
    timer: { exp: 1.2, lin: 3 },
    point: { initial: 40, exp: 2.2, lin: 15 },
  },
} as const

function generateRound(id: number, run: RunState): Round {
  const runId = run.runId
  const rng = new Rand(`round-${runId}-${id}`)
  const { timer, point } = DIFFICULTY[run.difficulty!]

  function variation() {
    const rand = rng.next()
    return 1 + (rand * 2 - 1) * 0.1
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

export function calculateIncome(run: RunState) {
  return 3 + run.round
}

export function roundPersistentKey(run: RunState) {
  return `${run.runId}-${run.round}`
}

function createLevel(
  level: number,
  rewards: number,
  collection: Readonly<Card[]>[],
): Level {
  return {
    level,
    rewards,
    tileItems: collection.flatMap((cards) =>
      cards.flatMap((card, i) =>
        Array.from({ length: ITEM_POOL_SIZE }, (_, j) => ({
          id: `${level}-${i}-${j}`,
          cardId: card.id,
          type: "tile",
          cost: ITEM_COST + Math.round((level - 1) / 3),
        })),
      ),
    ),
  }
}

function getLevels(runId: string): Levels {
  const rnd = new Rand(runId)
  const nonBlackDragons = dragons.filter((c) => c.rank !== "k")
  const blackDragons = dragons.filter((c) => c.rank === "k")

  const [brush1, brush2, brush3] = shuffle([...brushes], rnd)
  const [first1, first2, first3, first4] = shuffle(
    [rabbits, frogs, lotuses, sparrows],
    rnd,
  )
  const [second1, second2, second3, second4] = shuffle(
    [flowers, mutations, taijitu, phoenixes],
    rnd,
  )
  const [third1, third2, third3, third4] = shuffle(
    [elements, gems, jokers, blackDragons],
    rnd,
  )
  const [extra1, extra2, extra3] = shuffle(
    [bams, bams, cracks, cracks, dots, dots],
    rnd,
  )

  return [
    createLevel(1, 0, [bams, cracks, dots]),
    createLevel(2, winds.length, [winds]),
    createLevel(3, 1, [nonBlackDragons]),
    createLevel(4, 0, [extra1!]),
    createLevel(5, 1, [first1!]),
    createLevel(6, 1, [first2!]),
    createLevel(7, 0, [extra2!]),
    createLevel(8, 1, [first3!]),
    createLevel(9, 1, [first4!]),
    createLevel(10, 1, [[brush1!]]),
    createLevel(11, 0, [extra3!]),
    createLevel(12, 1, [second1!]),
    createLevel(13, 1, [second2!]),
    createLevel(14, 1, [second3!]),
    createLevel(15, 0, []),
    createLevel(16, 1, [second4!]),
    createLevel(17, 1, [[brush2!]]),
    createLevel(18, 1, [third1!]),
    createLevel(19, 0, []),
    createLevel(20, 1, [third2!]),
    createLevel(21, 1, [third3!]),
    createLevel(22, 1, [third4!]),
    createLevel(23, 0, []),
    createLevel(24, 1, [[brush3!]]),
  ]
}
