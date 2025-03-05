/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Duel } from "./routes/duel"
import { Home } from "./routes/home"
import { Solo } from "./routes/solo"
import { Instructions } from "./routes/instructions"
import RunSelectGame from "./routes/run/selectGame"
import { Layout } from "./components/layout"
import Run from "./routes/run"
import RunGame from "./routes/run/runGame"

import "./styles/reset.css"

const root = document.getElementById("root")

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/play/:id" component={Solo} />
      <Route path="/duel/:id" component={Duel} />
      <Route path="/run/:id" component={Run}>
        <Route path="/" component={RunSelectGame} />
        <Route path="/game/:gameId" component={RunGame} />
      </Route>
      <Route path="/instructions" component={Instructions} />
    </Router>
  ),
  root!,
)
