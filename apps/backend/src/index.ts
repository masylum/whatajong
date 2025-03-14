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

export default app
