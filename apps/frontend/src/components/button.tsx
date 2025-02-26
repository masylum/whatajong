import type { JSX } from "solid-js"
import { buttonClass } from "./button.css"
import type { AccentHue } from "@/styles/colors"

type Props = {
  href: string
  hue: AccentHue
} & JSX.IntrinsicElements["a"]

export function LinkButton(props: Props) {
  return (
    <a class={buttonClass({ hue: props.hue })} href={props.href}>
      {props.children}
    </a>
  )
}

type ButtonProps = {
  hue: AccentHue
} & JSX.IntrinsicElements["button"]

export function Button(props: ButtonProps) {
  return (
    <button
      class={buttonClass({ hue: props.hue })}
      type={props.type}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
