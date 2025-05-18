/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { HashRouter } from "@solidjs/router"
import { Show, render } from "solid-js/web"
import { Layout } from "./components/layout"
import { Home } from "./routes/home"
import { Run } from "./routes/run"
import "@fontsource-variable/nunito"
import "./styles/reset.css"
import type { ParentProps } from "solid-js"
import { initObservability } from "./lib/observability"
import { Help } from "./routes/help"
import New from "./routes/new"
import { Settings } from "./routes/settings"

const root = document.getElementById("root")

initObservability()

render(() => {
  return (
    <MainRouter>
      <Route path="/" component={Home} />
      <Route path="/play" component={Run} />
      <Route path="/settings" component={Settings} />
      <Route path="/new" component={New} />
      <Route path="/help" component={Help} />
    </MainRouter>
  )
}, root!)

function MainRouter(props: ParentProps) {
  return (
    <Show
      when={import.meta.env.VITE_ITCH_IO}
      fallback={<Router root={Layout}>{props.children}</Router>}
    >
      <HashRouter root={Layout}>{props.children}</HashRouter>
    </Show>
  )
}
