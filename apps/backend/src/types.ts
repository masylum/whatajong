export type Env = {
  APP_URL: string
}

export type AppType = {
  Variables: { rateLimit: boolean }
  Bindings: Env
}
