import {
  type ParentProps,
  createContext,
  createEffect,
  useContext,
} from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

type GlobalState = {
  muted: boolean
  locale: string
  tutorial: boolean
}

export function createGlobalState() {
  return createPersistantMutable<GlobalState>({
    namespace: "global-state",
    id: () => "global-state",
    init: () => ({
      muted: false,
      locale: navigator.language,
      tutorial: false,
    }),
  })
}

const GlobalStateContext = createContext<GlobalState | undefined>()

export function GlobalStateProvider(
  props: { globalState: GlobalState } & ParentProps,
) {
  createEffect(() => {
    Howler.mute(props.globalState.muted)
  })

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
