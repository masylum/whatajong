import { fetchRuns, runGameWin, type RunState } from "@/state/runState"
import { createMemo, For, Show } from "solid-js"
import {
  gamesClass,
  containerClass,
  subtitleClass,
  titleClass,
  titleContainerClass,
  tableClass,
  tableHeaderClass,
  tableCellClass,
  tableRowClass,
  tableCellNameClass,
  backButtonClass,
} from "./runList.css"
import { LinkButton } from "@/components/button"
import { nanoid } from "nanoid"
import { ArrowLeft, ArrowRight } from "@/components/icon"
import { adjectives, nouns } from "@/lib/names"
import { pickFromArray } from "@/lib/rand"
import Rand from "rand-seed"
import { fetchGameState } from "@/state/gameState"

export default function RunList() {
  const runs = createMemo<RunState[]>(() => fetchRuns())

  return (
    <div class={containerClass}>
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot" kind="dark">
          <ArrowLeft />
        </LinkButton>
      </div>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>Let's play!</h1>
      </div>
      <div>
        <LinkButton kind="dark" href={`/run/${nanoid()}`} hue="bam">
          Start a new adventure
          <ArrowRight />
        </LinkButton>
      </div>
      <div class={gamesClass}>
        <h2 class={subtitleClass}>Past games</h2>
        <table class={tableClass}>
          <thead class={tableHeaderClass}>
            <tr>
              <th class={tableCellClass}>Run</th>
              <th class={tableCellClass}>Round</th>
              <th class={tableCellClass}>Stage</th>
              <th class={tableCellClass}>Difficulty</th>
              <th class={tableCellClass} />
            </tr>
          </thead>
          <tbody>
            <For each={runs()}>{(run) => <RunRow run={run} />}</For>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RunRow(props: { run: RunState }) {
  const gameState = createMemo(() =>
    fetchGameState(`${props.run.runId}-${props.run.round}`),
  )
  const hue = createMemo(() => {
    if (props.run.stage !== "game") return "dot"
    const game = gameState()
    if (!game) return "dot"

    const win = runGameWin(game, props.run)
    if (win) return "dot"

    return "crack"
  })

  return (
    <tr class={tableRowClass({ hue: hue() })}>
      <td class={tableCellNameClass}>{generateName(props.run.runId)}</td>
      <td class={tableCellClass}>{props.run.round}</td>
      <td class={tableCellClass}>
        <Show
          when={gameState()?.endCondition === "no-pairs"}
          fallback={props.run.stage}
        >
          lost game
        </Show>
      </td>
      <td class={tableCellClass}>{props.run.difficulty}</td>
      <td class={tableCellClass}>
        <LinkButton href={`/run/${props.run.runId}`} hue={hue()} kind="dark">
          Go
          <ArrowRight />
        </LinkButton>
      </td>
    </tr>
  )
}

function generateName(runId: string) {
  const rand = new Rand(runId)
  const adjective = pickFromArray(adjectives, rand)
  const name = pickFromArray(nouns, rand)
  return `${adjective} ${name}`
}
