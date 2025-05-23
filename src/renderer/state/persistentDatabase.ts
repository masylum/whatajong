import type { Database } from "@/lib/in-memoriam"
import { createEffect } from "solid-js"

type CreateDbParams<T> = {
  namespace: string
  db: T
  init: () => void
}
export function createPersistentDatabase<T extends Database<any, any>>(
  params: CreateDbParams<T>,
) {
  const persistedState = localStorage.getItem(params.namespace)
  const db = params.db

  if (persistedState) {
    db.update(JSON.parse(persistedState))
  } else {
    params.init()
  }

  createEffect(() => {
    localStorage.setItem(params.namespace, JSON.stringify(db.byId))
  })
}
