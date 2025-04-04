import { generateRound, type Round } from "@/state/runState"
import { batch, createMemo, createSelector, For, Show } from "solid-js"
import { Button } from "@/components/button"
import { useRunState } from "@/state/runState"
import {
  gamesClass,
  containerClass,
  gameClass,
  subtitleClass,
  titleClass,
  titleContainerClass,
  gameTitleClass,
  detailTermClass,
  detailListClass,
  detailDescriptionClass,
} from "./runSelect.css"
import { Goal, Hourglass } from "@/components/icon"

export default function RunSelect() {
  const run = useRunState()
  const isCurrentRound = createSelector(() => run.round)
  const nextRounds = createMemo(() => {
    const rounds = []

    for (let i = 0; i < 3; i++) {
      rounds.push(generateRound(run.round + i, run))
    }

    return rounds
  })

  function selectRound(round: Round) {
    batch(() => {
      run.round = round.id
      run.stage = "game"
    })
  }

  return (
    <div class={containerClass}>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>Get ready!</h1>
        <h2 class={subtitleClass}>
          Win the current round to unlock the next ones.
        </h2>
      </div>
      <div class={gamesClass}>
        <For each={nextRounds()}>
          {(round) => (
            <div class={gameClass({ current: isCurrentRound(round.id) })}>
              <h2 class={gameTitleClass}>Round {round.id}</h2>
              <dl class={detailListClass}>
                <dd class={detailTermClass}>
                  <Goal /> Points
                </dd>
                <dt class={detailDescriptionClass}>{round.pointObjective}</dt>
                <dd class={detailTermClass}>
                  <Hourglass /> Penalty
                </dd>
                <dt class={detailDescriptionClass}>
                  {round.timerPoints.toFixed(2)}
                </dt>
              </dl>
              <Show when={isCurrentRound(round.id)}>
                <Button
                  hue="bam"
                  kind="dark"
                  onClick={() => selectRound(round)}
                >
                  Play
                </Button>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
