import braveGates from "@/assets/BraveGates.otf"
import rotate from "@/assets/rotate.webp"
import { useTranslation } from "@/i18n/useTranslation"
import { GlobalStateProvider, createGlobalState } from "@/state/globalState"
import { breakpoints } from "@/styles/breakpoints"
import nunito from "@fontsource-variable/nunito?url"
import { createBreakpoints } from "@solid-primitives/media"
import { useWindowSize } from "@solid-primitives/resize-observer"
import { Link, MetaProvider } from "@solidjs/meta"
import { type ParentProps, Show, createMemo } from "solid-js"
import { RunStateProvider, createRunState } from "../state/runState"
import { Defs } from "./game/defs"
import { portraitClass, subtitleClass, titleClass } from "./layout.css"

export function Layout(props: ParentProps) {
  const globalState = createGlobalState()
  const size = useWindowSize()
  const isPortrait = createMemo(() => size.width > size.height)
  const match = createBreakpoints(breakpoints, { mediaFeature: "min-height" })
  const forcePortrait = createMemo(() => {
    const key = match.key
    if (key === "xxs" || key === "xs" || key === "s") {
      return isPortrait()
    }
    return false
  })
  const run = createRunState()

  return (
    <MetaProvider>
      <GlobalStateProvider globalState={globalState}>
        <RunStateProvider run={run}>
          <Link
            rel="preload"
            as="font"
            type="font/woff2"
            href={nunito}
            crossorigin="anonymous"
          />
          <Link
            rel="preload"
            as="font"
            type="font/woff2"
            href={braveGates}
            crossorigin="anonymous"
          />
          <Defs />
          <Show when={forcePortrait()} fallback={props.children}>
            <Portrait />
          </Show>
        </RunStateProvider>
      </GlobalStateProvider>
    </MetaProvider>
  )
}

function Portrait() {
  const t = useTranslation()

  return (
    <div class={portraitClass}>
      <h1 class={titleClass}>Whatajong</h1>
      <h1 class={subtitleClass}>{t.layout.rotate()}</h1>
      <img src={rotate} alt={t.layout.rotate()} height={150} />
    </div>
  )
}
