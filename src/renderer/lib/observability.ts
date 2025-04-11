import posthog from "posthog-js"

export function initObservability() {
  if (import.meta.env.MODE === "development") return
  posthog.init("phc_jgksyhrnlwlQ2I5iWOZP6h7CKgf22tTxSJgWpMWYd9g", {
    api_host: "https://eu.i.posthog.com",
    autocapture: false,
  })
}

export function captureRun(runId: string, type: "solo" | "adventure") {
  if (import.meta.env.MODE === "development") return
  setTimeout(() => {
    posthog.group("run", runId)
    posthog.capture("run_started", { type })
  }, 100)
}

export function captureEvent(event: string, properties: Record<string, any>) {
  if (import.meta.env.MODE === "development") return
  setTimeout(() => {
    posthog.capture(event, properties)
  }, 100)
}
