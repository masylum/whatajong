import { createContext, useContext, type ParentProps } from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

type SelectTiles = { state: "select-tiles"; pair?: [string, string] }
type Board = { state: "board" }
type SelectDragons = { state: "select-dragons"; pair?: [string, string] }
type Emperor = { state: "emperor" }
type SelectWinds = { state: "select-winds"; pair?: [string, string] }
type Done = { state: "done" }
type Tour = SelectTiles | Board | SelectDragons | Emperor | SelectWinds | Done

export type GlobalState = {
  muted: boolean
  tourGame: Tour
}

export function createGlobalState() {
  return createPersistantMutable<GlobalState>({
    namespace: "global-state",
    id: () => "global-state",
    init: () => ({
      muted: false,
      tourGame: { state: "select-tiles" },
    }),
  })
}

const GlobalStateContext = createContext<GlobalState | undefined>()

export function GlobalStateProvider(
  props: { globalState: GlobalState } & ParentProps,
) {
  return (
    <GlobalStateContext.Provider value={props.globalState}>
      {props.children}
    </GlobalStateContext.Provider>
  )
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error("can't find GlobalStateContext")

  return context
}
