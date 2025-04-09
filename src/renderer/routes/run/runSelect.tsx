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
import { useTranslation } from "@/i18n/useTranslation"

export default function RunSelect() {
  const t = useTranslation()
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
        <h1 class={titleClass}>{t.runSelect.title()}</h1>
        <h2 class={subtitleClass}>{t.runSelect.subtitle()}</h2>
      </div>
      <div class={gamesClass}>
        <For each={nextRounds()}>
          {(round) => (
            <div class={gameClass({ current: isCurrentRound(round.id) })}>
              <h2 class={gameTitleClass}>
                {t.common.roundN({ round: round.id })}
              </h2>
              <dl class={detailListClass}>
                <dd class={detailTermClass}>
                  <Goal /> {t.common.points()}
                </dd>
                <dt class={detailDescriptionClass}>{round.pointObjective}</dt>
                <dd class={detailTermClass}>
                  <Hourglass /> {t.common.penalty()}
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
                  {t.common.play()}
                </Button>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
