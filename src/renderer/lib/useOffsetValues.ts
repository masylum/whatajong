import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js"

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

export function useIsLagging<T>(value: Accessor<T>, duration: number) {
  const laggingValue = useLaggingValue(value, duration)
  return createMemo(() => laggingValue() !== value())
}
