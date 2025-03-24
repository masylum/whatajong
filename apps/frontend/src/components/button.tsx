import type { JSX } from "solid-js"
import { buttonClass } from "./button.css"
import type { AccentHue } from "@/styles/colors"
import { play, SOUNDS } from "./audio"

type Kind = "light" | "dark"
type Props = {
  href: string
  hue: AccentHue
  kind?: Kind
} & JSX.IntrinsicElements["a"]

function onHover() {
  play(SOUNDS.CLICK2)
}

export function LinkButton(props: Props) {
  return (
    <a
      onMouseEnter={onHover}
      class={buttonClass({ hue: props.hue, kind: props.kind })}
      href={props.href}
    >
      {props.children}
    </a>
  )
}

type ButtonProps = {
  hue: AccentHue
  kind?: Kind
} & JSX.IntrinsicElements["button"]

export function Button(props: ButtonProps) {
  return (
    <button
      onMouseEnter={onHover}
      class={buttonClass({ hue: props.hue, kind: props.kind })}
      type={props.type}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
