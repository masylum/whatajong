import { createMemo } from "solid-js"
import {
  emperorContainerClass,
  detailInfoClass,
  detailsDialogClass,
  emperorIconClass,
} from "./emperorDetails.css"
import type { Emperor } from "@/state/emperors"
import { BasicEmperor } from "../emperor"

export function EmperorDetailsDialog(props: {
  emperor: Emperor
}) {
  const name = createMemo(() => props.emperor.name)
  const description = createMemo(() => props.emperor.description())

  return (
    <div class={detailsDialogClass}>
      <BasicEmperor class={emperorIconClass} name={name()} />
      <div class={emperorContainerClass}>
        <span>{name().replaceAll("_", " ")}</span>
        <div class={detailInfoClass}>{description()}</div>
      </div>
    </div>
  )
}
