import { useParams } from "@solidjs/router"
import { RunStateProvider, initRunState, saveRunState } from "../state/runState"
import { createEffect, createMemo, type ParentProps } from "solid-js"

export default function Run(props: ParentProps) {
  const params = useParams()
  const newRun = createMemo(() => initRunState(params.id!))

  createEffect(() => {
    saveRunState(newRun().get())
  })

  return <RunStateProvider run={newRun()}>{props.children}</RunStateProvider>
}
