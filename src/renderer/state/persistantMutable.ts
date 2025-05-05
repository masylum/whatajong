import { createEffect, on } from "solid-js"
import { createMutable, modifyMutable, reconcile } from "solid-js/store"

function key(namespace: string, id: string) {
  return `${namespace}-${id}`
}

type CreatePersistantParams<T> = {
  namespace: string
  id: () => string
  init: (id: string) => T
}
export function createPersistantMutable<T extends Record<string, any>>(
  params: CreatePersistantParams<T>,
) {
  const mutable = createMutable<T>(params.init(params.id()))

  createEffect(
    on(params.id, (id) => {
      const persistedState = localStorage.getItem(key(params.namespace, id))

      setMutable(
        mutable,
        persistedState ? JSON.parse(persistedState) : params.init(id),
      )
    }),
  )

  createEffect(
    on(
      () => JSON.stringify(mutable),
      (json) => {
        localStorage.setItem(key(params.namespace, params.id()), json)
      },
    ),
  )

  return mutable
}

export function setMutable<T>(mutable: T, value: T) {
  modifyMutable(mutable, reconcile(value))
}

export function cleanMutable(namespace: string, id: string) {
  localStorage.removeItem(key(namespace, id))
}
