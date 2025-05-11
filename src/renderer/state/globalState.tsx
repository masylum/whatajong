import { musicVolume } from "@/components/audio"
import {
  type ParentProps,
  createContext,
  createEffect,
  useContext,
} from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

type GlobalState = {
  soundVolume: number
  musicVolume: number
  locale: string
  difficulty: "easy" | "medium" | "hard" | "impossible"
}

const NAMESPACE = "global-state-v3"

export function createGlobalState() {
  return createPersistantMutable<GlobalState>({
    namespace: NAMESPACE,
    init: () => ({
      soundVolume: 1,
      musicVolume: 1,
      difficulty: "easy",
      locale: navigator.language,
    }),
  })
}

const GlobalStateContext = createContext<GlobalState | undefined>()

export function GlobalStateProvider(
  props: { globalState: GlobalState } & ParentProps,
) {
  createEffect(() => {
    musicVolume(props.globalState.musicVolume)
    Howler.volume(props.globalState.soundVolume)
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
