/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Game } from "./routes/game"
import { Home } from "./routes/home"
import { Solo } from "./routes/solo"

const root = document.getElementById("root")

import "./styles/reset.css"

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/play/:id" component={Solo} />
      <Route path="/:userId/games/:id" component={Game} />
    </Router>
  ),
  root!,
)
