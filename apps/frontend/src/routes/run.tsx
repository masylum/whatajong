import { useParams } from "@solidjs/router"
import { createRunState, RunStateProvider } from "../state/runState"
import RunGame from "./run/runGame"
import RunSelect from "./run/runSelect"
import { Match, Switch } from "solid-js"
import RunShop from "./run/runShop"
import { createDeckState, DeckStateProvider } from "@/state/deckState"

export default function Run() {
  const params = useParams()

  const newRun = createRunState(() => params.id!)
  const newDeck = createDeckState(() => params.id!)

  return (
    <RunStateProvider run={newRun()}>
      <DeckStateProvider deck={newDeck()}>
        <Switch>
          <Match when={newRun().get().stage === "select"}>
            <RunSelect />
          </Match>
          <Match when={newRun().get().stage === "game"}>
            <RunGame />
          </Match>
          <Match when={newRun().get().stage === "shop"}>
            <RunShop />
          </Match>
        </Switch>
      </DeckStateProvider>
    </RunStateProvider>
  )
}
