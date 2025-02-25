import type { ParentProps } from "solid-js"
import { buttonClass } from "./button.css"
import type { AccentHue } from "@/styles/colors"

type Props = {
  href: string
  hue: AccentHue
} & ParentProps

export function LinkButton(props: Props) {
  return (
    <a class={buttonClass({ hue: props.hue })} href={props.href}>
      {props.children}
    </a>
  )
}
