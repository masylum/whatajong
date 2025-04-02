import { Dialog } from "@kobalte/core/dialog"
import type { JSXElement } from "solid-js"
import { X } from "./icon"
import {
  closeButtonClass,
  contentClass,
  overlayClass,
  positionerClass,
} from "./dialog.css"

type Props = {
  trigger: JSXElement
  content: JSXElement
}

export function Modal(props: Props) {
  return (
    <Dialog>
      {props.trigger}
      <Dialog.Portal>
        <Dialog.Overlay class={overlayClass} />
        <div class={positionerClass}>
          <Dialog.Content class={contentClass}>
            <Dialog.CloseButton class={closeButtonClass}>
              <X />
            </Dialog.CloseButton>
            {props.content}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  )
}
