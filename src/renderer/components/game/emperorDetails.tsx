import {
  type Emperor,
  EmperorDescription,
  EmperorTitle,
} from "@/state/emperors"
import { createMemo } from "solid-js"
import { BasicEmperor } from "../emperor"
import {
  detailInfoClass,
  detailsDialogClass,
  emperorContainerClass,
  emperorIconClass,
} from "./emperorDetails.css"

export function EmperorDetailsDialog(props: {
  emperor: Emperor
}) {
  const name = createMemo(() => props.emperor.name)

  return (
    <div class={detailsDialogClass}>
      <BasicEmperor class={emperorIconClass} name={name()} />
      <div class={emperorContainerClass}>
        <span>
          <EmperorTitle name={name()} />
        </span>
        <div class={detailInfoClass}>
          <EmperorDescription name={name()} />
        </div>
      </div>
    </div>
  )
}
