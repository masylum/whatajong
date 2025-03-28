import { generateRound, type Round } from "@/state/runState"
import {
  batch,
  createMemo,
  createSelector,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js"
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
  tipsClass,
  tipTitleClass,
  tipClass,
} from "./runSelect.css"
import { Goal, Hourglass } from "@/components/icon"
import { MiniTiles } from "@/components/miniTiles"

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
  const [tip, setTip] = createSignal(Math.floor(Math.random() * 3))

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
                <dt class={detailDescriptionClass}>
                  {round.pointObjective} points
                </dt>
                <dd class={detailTermClass}>
                  <Hourglass /> Penalty
                </dd>
                <dt class={detailDescriptionClass}>
                  {round.timerPoints.toFixed(2)} points / sec&#8204;ond
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
      <div class={tipsClass} onClick={() => setTip((tip() + 1) % 3)}>
        <Show when={run.round > 1}>
          <div class={tipClass} onClick={() => setTip((tip() + 1) % 3)}>
            <Switch>
              <Match when={tip() === 0}>
                <h3 class={tipTitleClass}>Tip: Discard crew members</h3>
                <p>
                  Each board is solvable, but finding the solution requires
                  planning ahead.
                </p>
                <p>
                  Sometimes you will find yourself running out of moves so
                  remember that you can discard crew members to shuffle the
                  tiles.
                </p>
              </Match>
              <Match when={tip() === 1}>
                <h3 class={tipTitleClass}>Tip: Master Dragon Runs</h3>
                <p>
                  A Dragon Run starts when you match a pair of Dragon tiles (
                  <MiniTiles suit="d" />
                  ).
                </p>
                <p>
                  Matching tiles of the Dragon's suit grants you a multiplier
                  bonus and keeps the Dragon Run active.
                </p>
              </Match>
              <Match when={tip() === 2}>
                <h3 class={tipTitleClass}>Tip: Go fast!</h3>
                <p>
                  Each game includes a time penalty that gradually reduces your
                  score.
                </p>
                <p>
                  As you progress, you'll need to play faster to clear the board
                  while reaching the point goal.
                </p>
              </Match>
            </Switch>
          </div>
        </Show>
      </div>
    </div>
  )
}
