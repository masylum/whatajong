import { createEffect, on } from "solid-js"
import { createMutable, modifyMutable, reconcile } from "solid-js/store"

type CreatePersistantParams<T> = {
  namespace: string
  id: () => string
  init: T
}
export function createPersistantMutable<T extends Record<string, any>>(
  params: CreatePersistantParams<T>,
) {
  const shop = createMutable<T>(params.init)

  function key(id: string) {
    return `${params.namespace}-${id}`
  }

  createEffect(
    on(params.id, (id) => {
      const persistedState = localStorage.getItem(key(id))

      if (persistedState) {
        modifyMutable(shop, reconcile(JSON.parse(persistedState)))
      }
    }),
  )

  createEffect(() => {
    localStorage.setItem(key(params.id()), JSON.stringify(shop))
  })

  return shop
}
