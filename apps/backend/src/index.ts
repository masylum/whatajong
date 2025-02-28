import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { requestId } from "hono/request-id"
import type { AppType } from "./types"

const app = new Hono<AppType>()

app.use("*", requestId())
app.onError((err, c) => {
  console.log(err)
  if (err instanceof HTTPException) {
    c.error = undefined
    return c.json({ error: err.message }, err.status)
  }

  return c.json({ error: err.message }, 500)
})
app.use("/games/*", async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: [c.env.APP_URL],
  })
  return corsMiddlewareHandler(c, next)
})

app.get("/ws/:name", async (c) => {
  if (c.req.header("upgrade") !== "websocket") {
    return c.text("Expected Upgrade: websocket", 426)
  }

  const name = c.req.param("name")
  const id = c.env.GAME_STATE.idFromName(name)
  const stub = c.env.GAME_STATE.get(id)

  return await stub.fetch(c.req.raw)
})

export default app

export { GameState } from "./gameState.js"
