import type { ParentProps } from "solid-js"
import { buttonClass } from "./button.css"

type Props = {
  href: string
  hue: "bamboo" | "character"
} & ParentProps

export function LinkButton(props: Props) {
  return (
    <a class={buttonClass({ hue: props.hue })} href={props.href}>
      {props.children}
    </a>
  )
}
