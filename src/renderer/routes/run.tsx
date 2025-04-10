import { GameTutorial, RunTutorial } from "@/components/gameTutorial"
import { captureRun } from "@/lib/observability"
import { DeckStateProvider, createDeckState } from "@/state/deckState"
import { useParams } from "@solidjs/router"
import { Match, Switch, createMemo, onMount } from "solid-js"
import { RunStateProvider, createRunState } from "../state/runState"
import RunGame from "./run/runGame"
import RunIntro from "./run/runMode"
import RunSelect from "./run/runSelect"
import RunShop from "./run/runShop"

export function Run() {
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
            <GameTutorial>
              <RunGame />
            </GameTutorial>
          </Match>
          <Match when={run.stage === "shop"}>
            <RunTutorial>
              <RunShop />
            </RunTutorial>
          </Match>
        </Switch>
      </DeckStateProvider>
    </RunStateProvider>
  )
}
