import { createEffect } from "solid-js"
import { createMutable, modifyMutable, reconcile } from "solid-js/store"

type CreatePersistantParams<T> = {
  namespace: string
  init: () => T
}
export function createPersistantMutable<T extends Record<string, any>>(
  params: CreatePersistantParams<T>,
) {
  const persistedState = localStorage.getItem(params.namespace)
  const mutable = createMutable<T>(
    persistedState ? JSON.parse(persistedState) : params.init(),
  )

  createEffect(() => {
    localStorage.setItem(params.namespace, JSON.stringify(mutable))
  })

  return mutable
}

export function setMutable<T>(mutable: T, value: T) {
  modifyMutable(mutable, reconcile(value))
}
