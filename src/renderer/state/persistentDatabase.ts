import type { Database } from "@/lib/in-memoriam"
import { createEffect, createMemo, on } from "solid-js"

function key(namespace: string, id: string) {
  return `${namespace}-${id}`
}

type CreateDbParams<T> = {
  namespace: string
  id: () => string
  db: () => T
  init: (db: T, id: string) => void
}
export function persistentDatabase<T extends Database<any, any>>(
  params: CreateDbParams<T>,
) {
  const db = createMemo(params.db)

  function initDb(id: string) {
    const persistedState = localStorage.getItem(key(params.namespace, id))

    if (persistedState) {
      db().update(JSON.parse(persistedState))
    } else {
      params.init(db(), id)
    }
  }

  initDb(params.id())
  createEffect(on(params.id, initDb))
  createEffect(
    on(
      () => JSON.stringify(db().byId),
      (json) => {
        localStorage.setItem(key(params.namespace, params.id()), json)
      },
    ),
  )

  return db
}

export function cleanPersistentDatabase(namespace: string, id: string) {
  localStorage.removeItem(key(namespace, id))
}
