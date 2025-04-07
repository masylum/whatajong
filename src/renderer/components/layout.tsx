import { Defs } from "./game/defs"
import { createMemo, Show, type ParentProps } from "solid-js"
import { useWindowSize } from "@solid-primitives/resize-observer"
import { createGlobalState, GlobalStateProvider } from "@/state/globalState"
import { landscapeClass, titleClass, subtitleClass } from "./layout.css"
import { FallingTiles } from "./game/gameOver"
import { useBreakpoint } from "@/state/constants"
import { Link, MetaProvider } from "@solidjs/meta"
import nunito from "@fontsource-variable/nunito?url"
import { primaryUrl } from "@/styles/fontFamily.css"
import { useTranslation } from "@/i18n/useTranslation"

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
    <MetaProvider>
      <GlobalStateProvider globalState={globalState}>
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
          href={primaryUrl}
          crossorigin="anonymous"
        />
        <Defs />
        <Show when={forceLandscape()} fallback={props.children}>
          <Landscape />
        </Show>
      </GlobalStateProvider>
    </MetaProvider>
  )
}

function Landscape() {
  const t = useTranslation()

  return (
    <div class={landscapeClass}>
      <h1 class={titleClass}>Whatajong</h1>
      <h1 class={subtitleClass}>{t.layout.rotate()}</h1>
      <img src="/rotate.webp" alt={t.layout.rotate()} width={300} />
      <FallingTiles />
    </div>
  )
}
