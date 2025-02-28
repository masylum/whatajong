/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Duel } from "./routes/duel"
import { Home } from "./routes/home"
import { Solo } from "./routes/solo"
import { Instructions } from "./routes/instructions"

const root = document.getElementById("root")

import "./styles/reset.css"
import { Layout } from "./components/layout"

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/play/:id" component={Solo} />
      <Route path="/duel/:id" component={Duel} />
      <Route path="/instructions" component={Instructions} />
    </Router>
  ),
  root!,
)
