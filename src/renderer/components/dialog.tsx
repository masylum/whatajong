import { Dialog as KobalteDialog } from "@kobalte/core/dialog"
import type { JSXElement } from "solid-js"
import {
  closeButtonClass,
  contentClass,
  overlayClass,
  positionerClass,
} from "./dialog.css"
import { X } from "./icon"

type Props = {
  trigger: JSXElement
  content: JSXElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog(props: Props) {
  return (
    <KobalteDialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger}
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay class={overlayClass} />
        <div class={positionerClass}>
          <KobalteDialog.Content class={contentClass}>
            <KobalteDialog.CloseButton class={closeButtonClass}>
              <X />
            </KobalteDialog.CloseButton>
            {props.content}
          </KobalteDialog.Content>
        </div>
      </KobalteDialog.Portal>
    </KobalteDialog>
  )
}
