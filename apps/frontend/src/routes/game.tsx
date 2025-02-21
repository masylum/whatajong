import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js"
import { useParams } from "@solidjs/router"
import type { WsMessage } from "@repo/game/types"
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  db,
  loading,
  onMessage,
  sessions,
  setSessions,
  setUserId,
  userId,
} from "./state"
import { CursorArrow } from "./game/cursorArrow"
import { TileComponent } from "./game/tileComponent"
import { Players } from "./game/players"
import { Stats } from "./game/stats"
import { Defs } from "./game/defs"
import { gameRecipe, COMBO_ANIMATION_DURATION } from "./game.css"
import { DustParticles } from "./game/dustParticles"
import { getNumber, isDragon } from "@repo/game/deck"

const INTERVAL = 55

export function Game() {
  const params = useParams()

  const [ws, setWs] = createSignal<WebSocket | null>(null)

  function startWebSocket() {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(
      `${wsProtocol}://localhost:8787/ws/${params.id}?id=${userId()}`,
    )
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "get-cursors" }))
    }
    ws.onmessage = (message) => {
      onMessage(JSON.parse(message.data))
    }
    ws.onclose = () => setSessions({})

    return ws
  }

  const [abortController] = createSignal(new AbortController())
  const [lastSentTimestamp, setLastSentTimestamp] = createSignal(0)

  onMount(() => {
    setUserId(params.userId!)
    setWs(startWebSocket())

    document.addEventListener(
      "mousemove",
      (ev) => {
        const x = ev.pageX / CANVAS_WIDTH
        const y = ev.pageY / CANVAS_HEIGHT
        const now = Date.now()

        if (
          now - lastSentTimestamp() > INTERVAL &&
          ws()?.readyState === WebSocket.OPEN
        ) {
          const message = {
            type: "sessions-move",
            id: userId(),
            x,
            y,
          } as WsMessage
          ws()?.send(JSON.stringify(message))
          setLastSentTimestamp(now)
        }
      },
      {
        signal: abortController().signal,
      },
    )
  })

  onCleanup(() => {
    ws()?.close()
    abortController().abort()
  })

  return <Show when={ws()}>{(ws) => <Board ws={ws()} />}</Show>
}

type BoardProps = {
  ws: WebSocket
}
function Board(props: BoardProps) {
  const [comboAnimation, setComboAnimation] = createSignal(0)

  const otherSessions = createMemo(() =>
    Object.values(sessions).filter(
      ({ id, x, y }) => id !== userId() && x !== -1 && y !== -1,
    ),
  )

  const dragons = createMemo(() => {
    const [left, right] = db.players.all
      .sort((a, b) => a.order - b.order)
      .flatMap((player) =>
        db.powerups
          .filterBy({ playerId: player.id })
          .map((powerup) => isDragon(powerup.card))
          .filter((card) => !!card)
          .map((card) => getNumber(card)),
      )

    return { left, right }
  })

  const combo = createMemo(() => {
    const [left, right] = db.players.all
      .sort((a, b) => a.order - b.order)
      .flatMap((player) =>
        db.powerups
          .filterBy({ playerId: player.id })
          .map((powerup) => (isDragon(powerup.card) ? powerup.combo : 0)),
      )

    return { left: left, right: right }
  })

  createEffect((prevCombo: { left?: number; right?: number }) => {
    const { left, right } = combo()
    const { left: prevLeft, right: prevRight } = prevCombo

    const values = []

    if (left && prevLeft && left > prevLeft) {
      values.push(left)
    }

    if (right && prevRight && right > prevRight) {
      values.push(right)
    }

    if (values.length > 0) {
      const value = values.sort((a, b) => a - b)[0]!
      setComboAnimation(value)
      setTimeout(() => {
        setComboAnimation(0)
      }, COMBO_ANIMATION_DURATION)
    }

    return { left, right }
  }, combo())

  return (
    <Show when={!loading()}>
      <div
        class={gameRecipe({
          left: dragons().left,
          right: dragons().right,
          leftCombo: (combo().left as any) ?? "0",
          rightCombo: (combo().right as any) ?? "0",
          comboAnimation: comboAnimation() as any,
        })}
      >
        <Players />
        <Defs />
        <div
          style={{
            position: "relative",
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            margin: "0 auto",
          }}
        >
          <For each={db.tiles.all}>
            {(tile) => (
              <TileComponent
                tile={tile}
                onSelect={(tile) => {
                  const id = `${tile.id}-${userId()}`
                  const selection = {
                    id,
                    tileId: tile.id,
                    playerId: userId(),
                    confirmed: false,
                  }
                  db.selections.set(id, selection)

                  props.ws.send(
                    JSON.stringify({
                      type: "select-tile",
                      id: selection.id,
                      selection,
                    }),
                  )
                }}
              />
            )}
          </For>
        </div>
        <Stats />
        <For each={otherSessions()}>
          {(session) => <CursorArrow session={session} />}
        </For>
        <DustParticles />
      </div>
    </Show>
  )
}
