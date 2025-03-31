import { Audio } from "./audio"
import { Defs } from "./game/defs"
import { createMemo, Show, type ParentProps } from "solid-js"
import { useWindowSize } from "@solid-primitives/resize-observer"
import { createGlobalState, GlobalStateProvider } from "@/state/globalState"
import { landscapeClass, titleClass, subtitleClass } from "./layout.css"
import { FallingTiles } from "./game/gameOver"
import { useBreakpoint } from "@/state/constants"

export function Layout(props: ParentProps) {
  const globalState = createGlobalState()
  const size = useWindowSize()
  const isLandscape = createMemo(() => size.width > size.height)
  const match = useBreakpoint()
  const forceLandscape = createMemo(() => {
    const key = match.key
    if (key === "xxs" || key === "xs" || key === "s") {
      return !isLandscape()
    }
    return false
  })

  return (
    <GlobalStateProvider globalState={globalState}>
      <Defs />
      <Audio />
      <Show when={forceLandscape()} fallback={props.children}>
        <div class={landscapeClass}>
          <h1 class={titleClass}>Whatajong</h1>
          <h1 class={subtitleClass}>
            Please rotate your device to play on your phone
          </h1>
          <img src="/rotate.webp" alt="rotate your device" width={300} />
          <FallingTiles />
        </div>
      </Show>
    </GlobalStateProvider>
  )
}
