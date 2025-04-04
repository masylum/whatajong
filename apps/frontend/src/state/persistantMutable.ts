import { createEffect, on } from "solid-js"
import { createMutable, modifyMutable, reconcile } from "solid-js/store"

type CreatePersistantParams<T> = {
  namespace: string
  id: () => string
  init: () => T
}
export function createPersistantMutable<T extends Record<string, any>>(
  params: CreatePersistantParams<T>,
) {
  const mutable = createMutable<T>(params.init())

  function key(id: string) {
    return `${params.namespace}-${id}`
  }

  createEffect(
    on(params.id, (id) => {
      const persistedState = localStorage.getItem(key(id))

      if (persistedState) {
        modifyMutable(mutable, reconcile(JSON.parse(persistedState)))
      } else {
        modifyMutable(mutable, reconcile(params.init()))
      }
    }),
  )

  createEffect(
    on(
      () => JSON.stringify(mutable),
      (json) => {
        localStorage.setItem(key(params.id()), json)
      },
    ),
  )

  return mutable
}
