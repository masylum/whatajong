import { play } from "@/components/audio"
import { createChangeEffect } from "@/lib/createChangeEffect"
import {
  type Card,
  type CardId,
  type Deck,
  type DeckTile,
  type Material,
  bams,
  brushes,
  cracks,
  dots,
  dragons,
  elements,
  flowers,
  gems,
  isSuit,
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
import { captureEvent } from "@/lib/observability"
import { shuffle } from "@/lib/rand"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { countBy, entries } from "remeda"
import {
  type Accessor,
  type ParentProps,
  batch,
  createContext,
  createMemo,
  useContext,
} from "solid-js"
import {
  DeckStateProvider,
  createDeckState,
  initializeDeckState,
} from "./deckState"
import {
  GameStateProvider,
  createGameState,
  initialGameState,
} from "./gameState"
import { createPersistantMutable, setMutable } from "./persistantMutable"
import {
  TileStateProvider,
  createTileState,
  initializeTileState,
} from "./tileState"

const RUN_STATE_NAMESPACE = "run-state-v3"
export const TUTORIAL_SEED = "tutorial-seed"
const ITEM_COST = 3
const ITEM_POOL_SIZE = 9
export const REROLL_COST = 1
const ITEM_COUNT = 5

const PATHS = {
  r: ["garnet", "ruby"],
  g: ["jade", "emerald"],
  b: ["topaz", "sapphire"],
  k: ["quartz", "obsidian"],
} as const
export type Path = keyof typeof PATHS

type BaseItem = { id: string }
export type TileItem = BaseItem & {
  cardId: CardId
  type: "tile"
  cost: number
}

export type DeckTileItem = BaseItem & {
  cardId: CardId
  material: Material
  type: "deckTile"
}

type RunState = {
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
  reroll: number
  currentItem: TileItem | DeckTileItem | null
  tutorialStep: number | null
}

export type Difficulty = "easy" | "medium" | "hard"
export type RoundStage =
  | "intro"
  | "game"
  | "shop"
  | "gameOver"
  | "reward"
  | "end"
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
type Levels = Level[]

const RunStateContext = createContext<RunState | undefined>()
const RoundContext = createContext<Accessor<Round> | undefined>()
const LevelsContext = createContext<Accessor<Levels> | undefined>()

export function RunStateProvider(props: { run: RunState } & ParentProps) {
  const runId = createMemo(() => props.run.runId)
  const levels = createMemo(() => getLevels(runId()))
  const round = createMemo(() => generateRound(props.run.round, props.run))
  const roundId = createMemo(() => `${props.run.runId}-${props.run.round}`)

  const game = createGameState({ id: roundId })
  const deck = createDeckState()
  const tileDb = createTileState({ id: roundId(), deck: deck.all })

  createChangeEffect(() => {
    initializeDeckState(deck)
  }, runId)

  createChangeEffect((roundId) => {
    initializeTileState(roundId, deck.all, tileDb)
    setMutable(game, initialGameState(roundId))
  }, roundId)

  return (
    <RunStateContext.Provider value={props.run}>
      <RoundContext.Provider value={round}>
        <LevelsContext.Provider value={levels}>
          <GameStateProvider game={game}>
            <DeckStateProvider deck={deck}>
              <TileStateProvider tileDb={tileDb}>
                {props.children}
              </TileStateProvider>
            </DeckStateProvider>
          </GameStateProvider>
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

export function createRunState() {
  return createPersistantMutable<RunState>({
    namespace: RUN_STATE_NAMESPACE,
    init: () => initialRunState(TUTORIAL_SEED),
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
    reroll: 0,
    currentItem: null,
    tutorialStep: id === TUTORIAL_SEED ? 1 : null,
  }
}

const DIFFICULTY = {
  easy: {
    timer: { exp: 1.02, lin: 0.3 },
    point: { initial: 40, exp: 2, lin: 5 },
  },
  medium: {
    timer: { exp: 1.05, lin: 0.8 },
    point: { initial: 40, exp: 2.1, lin: 10 },
  },
  hard: {
    timer: { exp: 1.1, lin: 1 },
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

function createLevels(info: [number, Readonly<Card[]>[]][]): Levels {
  return info.map(([rewards, collection], level) => ({
    level,
    rewards,
    tileItems: collection.flatMap((cards) =>
      cards.flatMap((card, i) =>
        Array.from({ length: ITEM_POOL_SIZE }, (_, j) => ({
          id: `${level}-${i}-${j}`,
          cardId: card.id,
          type: "tile",
          cost: ITEM_COST + Math.round((isSuit(card.id) ? 1 : level - 1) / 3),
        })),
      ),
    ),
  }))
}

function getLevels(runId: string): Levels {
  const rnd = new Rand(runId)
  const nonBlackDragons = dragons.filter((c) => c.rank !== "k")
  const blackDragons = dragons.filter((c) => c.rank === "k")
  const blueBrush = brushes.find((c) => c.rank === "b")
  const redBrush = brushes.find((c) => c.rank === "r")
  const greenBrush = brushes.find((c) => c.rank === "g")

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

  return createLevels([
    [0, [bams, cracks, dots]],
    [winds.length, [winds]],
    [1, [nonBlackDragons]],
    [0, [extra1!]],
    [1, [first1!]],
    [1, [first2!]],
    [0, [extra2!]],
    [1, [first3!]],
    [1, [first4!]],
    [1, [[redBrush!]]],
    [0, [extra3!]],
    [1, [second1!]],
    [1, [second2!]],
    [1, [second3!]],
    [0, []],
    [1, [second4!]],
    [1, [[blueBrush!]]],
    [1, [third1!]],
    [0, []],
    [1, [third2!]],
    [1, [third3!]],
    [1, [third4!]],
    [0, []],
    [1, [[greenBrush!]]],
  ])
}

export function isTile(item: TileItem | DeckTileItem) {
  if (item.type === "tile") return item

  return null
}

export function generateItems(run: RunState, levels: Levels) {
  const runId = run.runId
  const round = run.freeze?.round || run.round
  const rng = new Rand(`items-${runId}-${round}`)
  const itemIds = new Set(run.items.map((i) => i.id))
  const initialPool = levels
    .filter((l) => l.level <= round)
    .flatMap((l) => l.tileItems)

  const poolSize = initialPool.length
  const reroll = run.freeze?.reroll || run.reroll
  const start = (ITEM_COUNT * reroll) % poolSize
  const shuffled = shuffle(initialPool, rng).filter(
    (item) => !itemIds.has(item.id),
  )

  const items = []
  for (let i = 0; i < ITEM_COUNT; i++) {
    const index = (start + i) % shuffled.length
    items.push(shuffled[index]!)
  }

  return items
}

function mergeCounts(
  count: Partial<Record<Material, number | undefined>>,
  path: Path,
) {
  const order = ["bone", ...PATHS[path]] as const
  const newCount = { ...count }

  for (const [i, material] of order.entries()) {
    const next = order[i + 1]
    if (!next) continue
    if (!newCount[material]) continue

    while (newCount[material] >= 3) {
      newCount[material] = (newCount[material] || 0) - 3
      newCount[next] = (newCount[next] || 0) + 1

      if (newCount[material] === 0) {
        delete newCount[material]
      }
    }
  }

  return newCount
}

export function getNextMaterials(tiles: DeckTile[], path: Path) {
  const count = countBy(tiles, (tile) => tile.material)
  count.bone = (count.bone || 0) + 1
  const newCount = mergeCounts(count, path)

  const result: Material[] = []
  for (const [material, count] of entries(newCount)) {
    for (let i = 0; i < count; i++) {
      result.push(material)
    }
  }
  return result
}

export function getNextMaterial(tiles: DeckTile[], path: Path) {
  const materials = getNextMaterials(tiles, path)
  return materials[materials.length - 1]!
}

type MaterialTransformation = {
  adds: boolean
  updates: Record<string, Material>
  removes: string[]
}
export function getTransformation(
  tiles: DeckTile[],
  path: Path,
): MaterialTransformation {
  const nextMaterials = getNextMaterials(tiles, path)
  const currentMaterials = tiles.map((tile) => tile.material)
  const updates: Record<string, Material> = {}
  const removes: string[] = []
  let adds = false

  for (const [index, tile] of tiles.entries()) {
    const mat = nextMaterials[index]
    if (!mat) {
      removes.push(tile.id)
      continue
    }

    if (mat !== tile.material) {
      updates[tile.id] = mat
    }
  }

  for (const [index, _] of nextMaterials.entries()) {
    if (!currentMaterials[index]) adds = true
  }

  return { adds, updates, removes }
}

export function buyTile({
  run,
  item,
  deck,
  reward = false,
}: {
  run: RunState
  item: TileItem
  deck: Deck
  reward?: boolean
}) {
  const cost = reward ? 0 : item.cost
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    run.currentItem = null
    const id = nanoid()
    deck.set(id, { id, material: "bone", cardId: item.cardId })
  })

  if (!reward) {
    play("coin2")
    captureEvent("tile_bought", { cardId: item.cardId })
  }
}

export function upgradeTile({
  run,
  item,
  deck,
  path,
}: {
  run: RunState
  item: TileItem
  deck: Deck
  path: Path
}) {
  const cost = item.cost
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    run.currentItem = null
    const { updates, removes } = getTransformation(
      deck.filterBy({ cardId: item.cardId }),
      path,
    )

    for (const [id, material] of entries(updates)) {
      deck.set(id, { id, material, cardId: item.cardId })
    }

    for (const id of removes) {
      deck.del(id)
    }
  })

  play("coin2")
  captureEvent("tile_upgraded", { cardId: item.cardId, path })
}
