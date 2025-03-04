import { createMemo, Show } from "solid-js"
import { state } from "@/state/state"
import { Board } from "@/components/game/board"
import { GameOver } from "@/components/game/gameOver"
import { useParams } from "@solidjs/router"
import { createOfflineMotor } from "@/state/motors/offline"

export function Solo() {
  const params = useParams()
  const controller = createOfflineMotor(() => params.id!)

  const started = createMemo(() => {
    const time = state.game.get().startedAt
    if (!time) return false

    return time <= Date.now()
  })

  return (
    <Show when={started()}>
      <Show
        when={state.game.get().endedAt}
        fallback={<Board controller={controller} />}
      >
        <GameOver controller={controller} />
      </Show>
    </Show>
  )
}
