import type { Database } from "@/lib/in-memoriam"
import { on } from "solid-js"
import { createEffect, createMemo } from "solid-js"

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

  function key(id: string) {
    return `${params.namespace}-${id}`
  }

  createEffect(
    on(params.id, (id) => {
      const persistedState = localStorage.getItem(key(id))

      if (persistedState) {
        db().update(JSON.parse(persistedState))
      } else {
        db().update({})
        params.init(db(), id)
      }
    }),
  )

  createEffect(
    on(
      () => JSON.stringify(db().byId),
      (json) => {
        localStorage.setItem(key(params.id()), json)
      },
    ),
  )

  return db
}
