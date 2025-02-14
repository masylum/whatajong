import type { Asset, Player, Selection, Tile } from "@repo/game/types"
import { createStore, produce } from "solid-js/store"
import { batch, createEffect, createMemo, createSignal } from "solid-js"
import type { Session, WsMessage } from "@repo/game/types"
import { tiltMap } from "@repo/game/map"
import { DEFAULT_MAP } from "@repo/game/maps/default"

type Id = number | string
type ById<Type> = { [id: Id]: Type }

export const db = {
  tiles: createDatabase<Tile>(),
  players: createDatabase<Player>(),
  selections: createDatabase<Selection>(),
  assets: createDatabase<Asset>(),
} as const

export const [loading, setLoading] = createSignal(true)
export const [sessions, setSessions] = createStore<Record<string, Session>>({})
export const [userId, setUserId] = createSignal<string>("")
export const [timer, setTimer] = createSignal<number>(0)
export const [hover, setHover] = createSignal<Tile | null>(null)

export const gameState = createMemo(() => {
  const assets = db.assets.byId
  const tiles = db.tiles.byId
  const map = DEFAULT_MAP()

  console.log("tiles", tiles, map)
  db.tiles.setById(
    produce((tiles) => {
      tiltMap({ assets, tiles, map })
    }),
  )
  console.log("tiles", tiles, map)

  return { map, tiles, assets }
})

createEffect(() => {
  console.log("gameState", gameState())
})

export type DB = typeof db
export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
export const SIDE_SIZES = { xSide: -8, ySide: 8 }

export function createDatabase<Type extends { id: Id }>() {
  const [byId, setById] = createStore({} as ById<Type>)

  function del(id: Id) {
    const entity = get(id)
    if (!entity) return

    setById(
      produce((byId) => {
        delete byId[id]
      }),
    )
  }

  function upsert(id: Id, newEntity: Type) {
    setById(id, newEntity)
  }

  function set(id: Id, newEntity?: Type) {
    if (newEntity) {
      setById(id, newEntity)
    } else {
      del(id)
    }
  }

  function replace(newEntities: ById<Type>) {
    setById(newEntities)
  }

  function all() {
    return Object.values(byId)
  }

  function get(id: Id) {
    return byId[id] || null
  }

  function empty() {
    return length() === 0
  }

  function length() {
    return Object.keys(byId).length
  }

  return {
    upsert,
    set,
    replace,
    del,
    byId,
    setById,
    all,
    get,
    empty,
    length,
  }
}

// TODO: extract message types
export function onMessage(msg: WsMessage) {
  switch (msg.type) {
    case "sessions-quit":
      setSessions(
        produce((sessions) => {
          delete sessions[msg.id]
        }),
      )
      return
    case "sessions-join":
      setSessions(msg.id, msg.session)
      return
    case "sessions-sync":
      setSessions(
        Object.fromEntries(
          msg.sessions.map((session) => [session.id, session]),
        ),
      )
      return
    case "sessions-move":
      setSessions(
        msg.id,
        produce((session) => {
          session.x = msg.x
          session.y = msg.y
        }),
      )
      return
    case "sync":
      batch(() => {
        for (const key in msg.diff) {
          const k = key as keyof DB
          const updates = msg.diff[k]!
          for (const id in updates) {
            db[k].set(id, updates[id] as any)
          }
        }
      })
      return
    case "init-state": {
      const json = msg.db
      console.log(msg)

      batch(() => {
        db.tiles.replace(json.tiles)
        db.selections.replace(json.selections)
        db.players.replace(json.players)
        db.assets.replace(json.assets)

        setTimer(msg.timer)
        setLoading(false)
      })
      return
    }
    default:
      break
  }
}
