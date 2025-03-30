/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Home } from "./routes/home"
import { Solo } from "./routes/solo/soloGame"
import { Layout } from "./components/layout"
import Run from "./routes/run"
import RunList from "./routes/run/runList"

import "@fontsource-variable/nunito"
import "./styles/reset.css"
import { initObservability } from "./lib/observability"

const root = document.getElementById("root")

initObservability()

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/play/:id" component={Solo} />
      <Route path="/runs" component={RunList} />
      <Route path="/run/:id" component={Run} />
    </Router>
  ),
  root!,
)
