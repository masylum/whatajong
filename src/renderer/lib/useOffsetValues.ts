import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js"

export function useLaggingValue<T>(value: Accessor<T>, duration: number) {
  const [get, set] = createSignal<T>(value())
  let timeout: NodeJS.Timeout | undefined

  createEffect((prevVal: T) => {
    const v = value()

    if (prevVal !== v) {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => set(v as any), duration)
    }

    return v
  }, value())

  onCleanup(() => {
    if (timeout) clearTimeout(timeout)
  })

  return get
}
