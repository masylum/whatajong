import { captureEvent, captureRun } from "@/lib/observability"
import { DeckStateProvider, createDeckState } from "@/state/deckState"
import { ShopStateProvider, createShopState } from "@/state/shopState"
import { useParams } from "@solidjs/router"
import { Match, Switch, createEffect, createMemo, onMount } from "solid-js"
import { RunStateProvider, createRunState } from "../state/runState"
import RunGame from "./run/runGame"
import RunMode from "./run/runMode"
import RunReward from "./run/runReward"
import RunShop from "./run/runShop"

export function Run() {
  const params = useParams()
  const id = createMemo(() => params.id!)

  const run = createRunState({ id })
  const newDeck = createDeckState({ id })
  const shop = createShopState({ id })

  onMount(() => {
    captureRun(id(), "adventure")
  })

  createEffect(() => {
    captureEvent("run_stage", { runId: id(), stage: run.stage })
  })

  return (
    <RunStateProvider run={run}>
      <DeckStateProvider deck={newDeck()}>
        <ShopStateProvider shop={shop}>
          <Switch>
            <Match when={run.stage === "intro"}>
              <RunMode />
            </Match>
            <Match when={run.stage === "game"}>
              <RunGame />
            </Match>
            <Match when={run.stage === "reward"}>
              <RunReward />
            </Match>
            <Match when={run.stage === "shop"}>
              <RunShop />
            </Match>
          </Switch>
        </ShopStateProvider>
      </DeckStateProvider>
    </RunStateProvider>
  )
}
