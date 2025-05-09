import { type Accessor, createEffect } from "solid-js"

export function createChangeEffect<T>(
  fn: (prev: T, curr: T) => void,
  value: Accessor<any>,
) {
  createEffect((prevVal: T) => {
    const val = value()

    if (prevVal !== val) {
      fn(prevVal, val)
    }

    return val
  }, value())
}
