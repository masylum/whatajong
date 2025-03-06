/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Duel } from "./routes/duel/duelGame"
import { Home } from "./routes/home"
import { Solo } from "./routes/solo/soloGame"
import { Instructions } from "./routes/instructions"
import { Layout } from "./components/layout"
import Run from "./routes/run"

import "./styles/reset.css"

const root = document.getElementById("root")

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/play/:id" component={Solo} />
      <Route path="/duel/:id" component={Duel} />
      <Route path="/run/:id" component={Run} />
      <Route path="/instructions" component={Instructions} />
    </Router>
  ),
  root!,
)
