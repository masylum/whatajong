import { Audio } from "./audio"
import { Defs } from "./game/defs"
import type { ParentProps } from "solid-js"

export function Layout(props: ParentProps) {
  return (
    <>
      <Defs />
      <Audio />
      {props.children}
    </>
  )
}
