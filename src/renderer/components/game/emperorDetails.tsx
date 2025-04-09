import { createMemo } from "solid-js"
import {
  emperorContainerClass,
  detailInfoClass,
  detailsDialogClass,
  emperorIconClass,
} from "./emperorDetails.css"
import {
  EmperorDescription,
  EmperorTitle,
  type Emperor,
} from "@/state/emperors"
import { BasicEmperor } from "../emperor"

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
