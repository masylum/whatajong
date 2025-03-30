import posthog from "posthog-js"

export function initObservability() {
  posthog.init("phc_jgksyhrnlwlQ2I5iWOZP6h7CKgf22tTxSJgWpMWYd9g", {
    api_host: "https://eu.i.posthog.com",
  })
}

export function captureRun(runId: string, type: "solo" | "adventure") {
  posthog.group("run", runId)
  posthog.capture("run_started", { type })
}

export function captureEvent(event: string, properties: Record<string, any>) {
  posthog.capture(event, properties)
}
