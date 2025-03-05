import type { RunState } from "@/state/runState"
import { useNavigate, useParams } from "@solidjs/router"
import { createEffect, createSignal, For, Show } from "solid-js"
import { createStore } from "solid-js/store"

type UpgradeOption = {
  id: string
  name: string
  description: string
  cost: number
  category: "tile" | "upgrade" | "layout" | "player"
  effect: (runState: RunState) => void
}

export default function RunShop() {
  const params = useParams()
  const navigate = useNavigate()
  const [runState, setRunState] = createStore<RunState>({} as RunState)
  const [selectedOption, setSelectedOption] =
    createSignal<UpgradeOption | null>(null)

  // Load run state from localStorage
  createEffect(() => {
    if (!params.runId) return

    const storedState = localStorage.getItem(`run-${params.runId}`)
    if (storedState) {
      const loadedState = JSON.parse(storedState)
      setRunState(loadedState)
    } else {
      // If no run state, navigate back to home
      navigate("/")
    }
  })

  // Generate available upgrades based on run state
  function getAvailableUpgrades(): UpgradeOption[] {
    if (!runState.runId) return []

    const baseUpgrades: UpgradeOption[] = [
      {
        id: "initial-points",
        name: "Initial Points +50",
        description: "Start each game with 50 more points",
        cost: 100,
        category: "player",
        effect: (state) => {
          state.initialPoints += 50
        },
      },
      {
        id: "slower-timer",
        name: "Slower Timer",
        description: "Timer deducts points more slowly",
        cost: 150,
        category: "player",
        effect: (state) => {
          state.timerSpeed += 1
        },
      },
      {
        id: "extra-shuffle",
        name: "Extra Shuffle",
        description: "Get one more shuffle per game",
        cost: 125,
        category: "player",
        effect: (state) => {
          state.shufflesAvailable += 1
        },
      },
      {
        id: "income-boost",
        name: "Income Boost",
        description: "Earn 10% more money from winning games",
        cost: 200,
        category: "player",
        effect: (state) => {
          state.incomeMultiplier *= 1.1
        },
      },
    ]

    // Add special tiles if the player has completed enough games
    if (runState.round >= 2) {
      baseUpgrades.push({
        id: "dragons-pack",
        name: "Dragon Tiles",
        description: "Add powerful dragon tiles to your deck",
        cost: 300,
        category: "tile",
        effect: (state) => {
          state.deck.push(["dc", "dc"], ["df", "df"], ["dp", "dp"])
        },
      })
    }

    if (runState.round >= 3) {
      baseUpgrades.push({
        id: "winds-pack",
        name: "Wind Tiles",
        description: "Add wind tiles to your deck",
        cost: 350,
        category: "tile",
        effect: (state) => {
          state.deck.push(
            ["wn", "wn"],
            ["ws", "ws"],
            ["we", "we"],
            ["ww", "ww"],
          )
        },
      })
    }

    if (runState.round >= 4) {
      baseUpgrades.push({
        id: "seasons-pack",
        name: "Season Tiles",
        description: "Add season tiles to your deck",
        cost: 400,
        category: "tile",
        effect: (state) => {
          state.deck.push(["s1", "s2"], ["s3", "s4"])
        },
      })

      baseUpgrades.push({
        id: "flowers-pack",
        name: "Flower Tiles",
        description: "Add flower tiles to your deck",
        cost: 400,
        category: "tile",
        effect: (state) => {
          state.deck.push(["f1", "f2"], ["f3", "f4"])
        },
      })
    }

    return baseUpgrades.filter((upgrade) => upgrade.cost <= runState.money)
  }

  function handleKeyPress(e: KeyboardEvent, action: () => void) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      action()
    }
  }

  function purchaseUpgrade(upgrade: UpgradeOption) {
    if (runState.money < upgrade.cost) return

    upgrade.effect(runState)
    setRunState("money", runState.money - upgrade.cost)
    localStorage.setItem(`run-${runState.runId}`, JSON.stringify(runState))
    setSelectedOption(null)
  }

  function continueRun() {
    navigate(`/run/${runState.runId}/game/${runState.currentGameId}`)
  }

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
        <h1 class="text-3xl font-bold mb-2 text-center text-blue-800">
          Run Shop
        </h1>
        <p class="text-center mb-6 text-gray-600">
          Spend your money on upgrades before the next game
        </p>

        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <p class="text-lg">
              <span class="font-bold">Money:</span> ${runState.money}
            </p>
            <p class="text-sm text-gray-600">
              Games completed: {runState.round}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <For each={getAvailableUpgrades()}>
            {(upgrade) => (
              <button
                type="button"
                class="text-left border rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors w-full"
                classList={{
                  "bg-blue-100 border-blue-500":
                    selectedOption()?.id === upgrade.id,
                }}
                onClick={() => setSelectedOption(upgrade)}
                onKeyDown={(e) =>
                  handleKeyPress(e, () => setSelectedOption(upgrade))
                }
                tabIndex={0}
                aria-label={`Select ${upgrade.name} upgrade`}
              >
                <div class="flex justify-between items-center mb-2">
                  <h3 class="font-bold">{upgrade.name}</h3>
                  <span class="text-green-700 font-bold">${upgrade.cost}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">{upgrade.description}</p>
                <span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                  {upgrade.category}
                </span>
              </button>
            )}
          </For>

          <Show when={getAvailableUpgrades().length === 0}>
            <div class="col-span-2 text-center p-6 border rounded-lg bg-gray-50">
              <p class="text-gray-600">
                No upgrades available. Earn more money by winning games!
              </p>
            </div>
          </Show>
        </div>

        <div class="flex justify-between">
          <Show when={selectedOption()}>
            <button
              type="button"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => purchaseUpgrade(selectedOption()!)}
            >
              Buy {selectedOption()?.name} (${selectedOption()?.cost})
            </button>
          </Show>

          <button
            type="button"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
            onClick={continueRun}
          >
            Continue to Next Game
          </button>
        </div>
      </div>
    </div>
  )
}
