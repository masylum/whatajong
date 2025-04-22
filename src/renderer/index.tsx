/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Layout } from "./components/layout"
import { Home } from "./routes/home"
import { Run } from "./routes/run"

import "@fontsource-variable/nunito"
import "./styles/reset.css"
import { initObservability } from "./lib/observability"

const root = document.getElementById("root")

initObservability()

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/run/:id" component={Run} />
    </Router>
  ),
  root!,
)
