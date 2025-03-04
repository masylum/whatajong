import { batch, createEffect, on, type Accessor } from "solid-js"
import { state, writeState, userId, readState, syncState } from "../state"
import { restartGame, selectTile } from "@repo/game/game"
import type { Selection } from "@repo/game/selection"
import type { GameController } from "./controller"
import Rand from "rand-seed"
import { useNavigate } from "@solidjs/router"
import { nanoid } from "nanoid"

export function createOfflineMotor(id: Accessor<string>): GameController {
  const navigate = useNavigate()

  createEffect(
    on(id, (id) => {
      const newState = readState(id)
      if (newState) {
        syncState(newState)
        return
      }

      const rng = new Rand(id)
      state.players.set(userId(), {
        id: userId(),
        points: 0,
        order: 0,
      })
      restartGame(state, rng)
    }),
  )

  createEffect(() => {
    try {
      writeState(id())
    } catch (error) {
      console.error(error)
    }
  })

  return {
    selectTile: (selection: Selection) => {
      batch(() => {
        selectTile(
          {
            tiles: state.tiles,
            selections: state.selections,
            players: state.players,
            powerups: state.powerups,
            game: state.game,
          },
          selection,
        )
      })
    },
    restartGame: () => {
      navigate(`/play/${nanoid()}`)
    },
    getWebSocket: () => null,
  }
}
