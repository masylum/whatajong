import { useParams } from "@solidjs/router"
import { createRunState, RunStateProvider } from "../state/runState"
import RunGame from "./run/runGame"
import RunSelect from "./run/runSelect"
import { createMemo, Match, onMount, Switch } from "solid-js"
import RunShop from "./run/runShop"
import { createDeckState, DeckStateProvider } from "@/state/deckState"
import RunIntro from "./run/runIntro"
import { captureRun } from "@/lib/observability"

export default function Run() {
  const params = useParams()
  const id = createMemo(() => params.id!)

  const run = createRunState({ id })
  const newDeck = createDeckState({ id })

  onMount(() => {
    captureRun(id(), "adventure")
  })

  return (
    <RunStateProvider run={run}>
      <DeckStateProvider deck={newDeck()}>
        <Switch>
          <Match when={run.stage === "intro"}>
            <RunIntro />
          </Match>
          <Match when={run.stage === "select"}>
            <RunSelect />
          </Match>
          <Match when={run.stage === "game"}>
            <RunGame />
          </Match>
          <Match when={run.stage === "shop"}>
            <RunShop />
          </Match>
        </Switch>
      </DeckStateProvider>
    </RunStateProvider>
  )
}
