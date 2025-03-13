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

export default function RunSelect() {
  const run = useRunState()
  const isCurrentRound = createSelector(() => run.round)
  const nextRounds = createMemo(() => {
    const rounds = []

    for (let i = 0; i < 3; i++) {
      rounds.push(generateRound(run.round + i, run.runId))
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
        <h1 class={titleClass}>Welcome to the adventure!</h1>
        <h2 class={subtitleClass}>Select your next board</h2>
      </div>
      <div class={gamesClass}>
        <For each={nextRounds()}>
          {(round) => (
            <div class={gameClass({ current: isCurrentRound(round.id) })}>
              <h2 class={gameTitleClass}>Round {round.id}</h2>
              <dl class={detailListClass}>
                <dd class={detailTermClass}>Objective</dd>
                <dt class={detailDescriptionClass}>
                  {round.pointObjective} points
                </dt>
                <Show when={round.timerPoints}>
                  <dd class={detailTermClass}>Time penalty</dd>
                  <dt class={detailDescriptionClass}>
                    {round.timerPoints} points
                  </dt>
                </Show>
                <Show when={round.emptyBoardBonus}>
                  <dd class={detailTermClass}>Clear bonus</dd>
                  <dt class={detailDescriptionClass}>
                    {round.emptyBoardBonus} points
                  </dt>
                </Show>
                <dd class={detailTermClass}>Reward</dd>
                <dt class={detailDescriptionClass}>${round.reward}</dt>
              </dl>
              <Show when={isCurrentRound(round.id)}>
                <Button
                  hue="bamboo"
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
