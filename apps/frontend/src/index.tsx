/* @refresh reload */
import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { Game } from "./routes/game"

const root = document.getElementById("root")

import "./styles/reset.css"

render(
  () => (
    <Router>
      <Route path="/:userId/games/:id" component={Game} />
    </Router>
  ),
  root!,
)
