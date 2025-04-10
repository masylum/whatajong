import type { AccentHue } from "@/styles/colors"
import { type JSX, splitProps } from "solid-js"
import { play } from "./audio"
import { buttonClass, shopButtonClass } from "./button.css"

type Kind = "light" | "dark"
type Props = {
  hue: AccentHue
  kind?: Kind
} & JSX.IntrinsicElements["a"]

export function LinkButton(iProps: Props) {
  const [props, aProps] = splitProps(iProps, ["hue", "kind"])

  return (
    <a
      onMouseEnter={() => play("click2")}
      class={buttonClass({ hue: props.hue, kind: props.kind, clickable: true })}
      {...aProps}
    />
  )
}

type ButtonProps = {
  hue: AccentHue
  kind?: Kind
} & JSX.IntrinsicElements["button"]
export function Button(iProps: ButtonProps) {
  const [props, buttonProps] = splitProps(iProps, ["hue", "kind"])

  return (
    <button
      onMouseEnter={() => !buttonProps.disabled && play("click2")}
      class={buttonClass({
        hue: props.hue,
        kind: props.kind,
        clickable: !!buttonProps.onClick,
      })}
      {...buttonProps}
    />
  )
}

type ShopButtonProps = {
  hue: AccentHue
} & JSX.IntrinsicElements["button"]
export function ShopButton(iProps: ShopButtonProps) {
  const [props, buttonProps] = splitProps(iProps, ["hue"])

  return (
    <button
      onMouseEnter={() =>
        !buttonProps.disabled && buttonProps.onClick && play("click2")
      }
      class={shopButtonClass({
        hue: props.hue,
        clickable: !!buttonProps.onClick,
      })}
      {...buttonProps}
    />
  )
}
