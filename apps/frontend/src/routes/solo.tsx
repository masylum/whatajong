import { Show } from "solid-js"
import { game } from "@/state/db"
import { Board } from "@/components/game/board"
import { GameOver } from "@/components/game/gameOver"
import { createOnlineMotor } from "@/state/motors/online"
import { useParams } from "@solidjs/router"

export function Solo() {
  const params = useParams()

  const ws = createOnlineMotor({
    id: () => params.id!,
    modality: "solo",
  })

  return (
    <Show when={ws()}>
      {(ws) => (
        <Show when={game()}>
          {(game) => (
            <Show
              when={game()?.endedAt}
              fallback={<Board ws={ws()} game={game()} />}
            >
              <GameOver game={game()} ws={ws()} />
            </Show>
          )}
        </Show>
      )}
    </Show>
  )
}
