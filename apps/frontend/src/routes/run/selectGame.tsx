import { generateRounds } from "@/state/runState"
import { createMemo, For, Show } from "solid-js"
import { LinkButton } from "@/components/button"
import { useRunState } from "@/state/runState"
import { gamesClass, containerClass, gameClass } from "./selectGame.css"

export default function Run() {
  const run = useRunState()
  const nextRounds = createMemo(() => {
    const currentRun = run.get()
    const rounds = []

    for (let i = 0; i < 3; i++) {
      rounds.push(generateRounds(currentRun.round + i, currentRun.runId))
    }

    return rounds
  })

  return (
    <div class={containerClass}>
      <div>
        <h1>Welcome to the adventure!</h1>
        <h2>Select your next board</h2>
      </div>
      <div class={gamesClass}>
        <For each={nextRounds()}>
          {(round) => (
            <div class={gameClass}>
              <div>
                <Show
                  when={round.challengeType === "points"}
                  fallback={
                    <>
                      <h2>Solve the board with at least</h2>
                      <h3>{round.pointObjective} points</h3>
                    </>
                  }
                >
                  <h2>Score at least:</h2>
                  <h3>{round.pointObjective} points</h3>
                </Show>
              </div>
              <h4>{round.timerPoints}</h4>
              <h4>{round.noDragons ? "No Dragons" : "Dragons allowed"}</h4>
              <h4>{round.noWinds ? "No Winds" : "Winds allowed"}</h4>
              <h4>{round.noFlowers ? "No Flowers" : "Flowers allowed"}</h4>
              <h4>{round.noSeasons ? "No Seasons" : "Seasons allowed"}</h4>
              <LinkButton
                hue="circle"
                href={`/run/${run.get().runId}/game/${round.gameId}`}
              >
                Select
              </LinkButton>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
