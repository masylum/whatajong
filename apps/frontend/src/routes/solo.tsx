import { Match, Show, Switch } from "solid-js"
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
            <Switch fallback={"TODO"}>
              <Match when={game().ended_at}>
                <GameOver game={game()} />
              </Match>
              <Match when={game().started_at}>
                <Board ws={ws()} game={game()} />
              </Match>
            </Switch>
          )}
        </Show>
      )}
    </Show>
  )
}
