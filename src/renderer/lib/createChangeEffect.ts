import { type Accessor, createEffect, on } from "solid-js"

export function createChangeEffect<T>(
  fn: (prev: T) => void,
  value: Accessor<T>,
) {
  createEffect(on(value, fn, { defer: true }))
}
