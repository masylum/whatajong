import { createMemo, Match, Show, Switch } from "solid-js"
import { useParams } from "@solidjs/router"
import {
  GameStateProvider,
  playerColors,
  useGameState,
  createGameState,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { createOnlineMotor } from "@/state/motors/online"
import { playersClass, playerClass, playerIdClass } from "./duelGame.css"
import type { Player } from "@repo/game/player"
import { Avatar } from "@/components/avatar"
import { CursorArrows } from "@/components/game/cursorArrows"
import { getStandardDeck } from "@repo/game/deck"
import { GameOverDuel } from "./gameOverDuel"
import { Frame } from "@/components/game/frame"
import { Stats } from "@/components/game/stats"
import { Powerups } from "@/components/game/powerups"
import NumberFlow from "solid-number-flow"
import { Lobby } from "./duelLobby"

export function Duel() {
  const params = useParams()

  const { state, started } = createGameState(() => params.id!, {
    map: "default",
    initialPoints: 150,
    deck: getStandardDeck(),
  })

  const { onSelectTile, onRestartGame, getWebSocket } = createOnlineMotor(
    state(),
    params.id!,
  )

  return (
    <GameStateProvider gameState={state()}>
      <Switch fallback={<Lobby />}>
        <Match when={state().game.get().endedAt}>
          <GameOverDuel onRestartGame={onRestartGame} />
        </Match>
        <Match when={started()}>
          <Frame
            board={<Board onSelectTile={onSelectTile} />}
            bottom={<Stats />}
            top={<Top />}
          />
          <Show when={getWebSocket()}>
            {(ws) => <CursorArrows websocket={ws()} />}
          </Show>
        </Match>
      </Switch>
    </GameStateProvider>
  )
}

function Top() {
  const gameState = useGameState()

  const firstPlayer = createMemo(() => gameState.players.all[0]!)
  const secondPlayer = createMemo(() => gameState.players.all[1]!)

  return (
    <div class={playersClass}>
      <PlayerComponent player={firstPlayer()} />
      <Show when={secondPlayer()}>
        <PlayerComponent player={secondPlayer()} />
      </Show>
    </div>
  )
}

function PlayerComponent(props: { player: Player }) {
  const pColors = createMemo(() => playerColors(props.player))

  return (
    <div class={playerClass} style={{ color: pColors()[2] }}>
      <Avatar name={props.player.id} colors={pColors()} />
      <div class={playerIdClass}>
        {props.player.id} ( <NumberFlow value={props.player.points} /> )
      </div>
      <Powerups player={props.player} />
    </div>
  )
}
