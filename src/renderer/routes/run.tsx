import { captureEvent, captureRun } from "@/lib/observability"
import { useRunState } from "@/state/runState"
import { useParams } from "@solidjs/router"
import { Match, Switch, createEffect, createMemo, onMount } from "solid-js"
import { RunEnd } from "./run/runEnd"
import RunGame from "./run/runGame"
import RunIntro from "./run/runIntro"
import RunReward from "./run/runReward"
import RunShop from "./run/runShop"

export function Run() {
  const params = useParams()
  const id = createMemo(() => params.id!)
  const run = useRunState()

  onMount(() => {
    captureRun(id(), "adventure")
  })

  createEffect(() => {
    captureEvent("run_stage", { runId: id(), stage: run.stage })
  })

  return (
    <Switch>
      <Match when={run.stage === "intro"}>
        <RunIntro />
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
      <Match when={run.stage === "end"}>
        <RunEnd />
      </Match>
    </Switch>
  )
}
