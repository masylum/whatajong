import { generateRound, type Round } from "@/state/runState"
import { createMemo, createSelector, For, Show } from "solid-js"
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
  gameDescriptionClass,
  gameRewardsClass,
} from "./runSelect.css"

export default function RunSelect() {
  const run = useRunState()
  const isCurrentRound = createSelector(() => run.get().round)
  const nextRounds = createMemo(() => {
    const currentRun = run.get()
    const rounds = []

    for (let i = 0; i < 3; i++) {
      rounds.push(generateRound(currentRun.round + i, currentRun.runId))
    }

    return rounds
  })

  function selectRound(round: Round) {
    // TODO: skip
    run.set({
      round: round.id,
      roundStage: "game",
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
              <Show
                when={round.challengeType === "points"}
                fallback={
                  <>
                    <h2 class={gameTitleClass}>Sudden death</h2>
                    <h3
                      class={gameDescriptionClass({
                        current: isCurrentRound(round.id),
                      })}
                    >
                      Solve the board before {round.pointObjective} seconds
                    </h3>
                  </>
                }
              >
                <h2 class={gameTitleClass}>High stakes</h2>
                <h3
                  class={gameDescriptionClass({
                    current: isCurrentRound(round.id),
                  })}
                >
                  Score at least {round.pointObjective} points
                </h3>
              </Show>
              <h4
                class={gameRewardsClass({ current: isCurrentRound(round.id) })}
              >
                ${round.reward}
              </h4>
              <Show when={isCurrentRound(round.id)}>
                <Button
                  hue="character"
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
