import { Audio } from "./audio"
import { Defs } from "./game/defs"
import type { ParentProps } from "solid-js"
import { createGlobalState, GlobalStateProvider } from "@/state/globalState"

export function Layout(props: ParentProps) {
  const globalState = createGlobalState()

  return (
    <GlobalStateProvider globalState={globalState}>
      <Defs />
      <Audio />
      {props.children}
    </GlobalStateProvider>
  )
}
