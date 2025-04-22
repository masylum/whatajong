import type { AccentHue } from "@/styles/colors"
import { type JSX, splitProps } from "solid-js"
import { play } from "./audio"
import { buttonClass, shopButtonClass } from "./button.css"

type ButtonProps = {
  hue: AccentHue
  kind?: Kind
  suave?: boolean
}
type Kind = "light" | "dark"

export function LinkButton(iProps: ButtonProps & JSX.IntrinsicElements["a"]) {
  const [props, aProps] = splitProps(iProps, ["hue", "kind", "suave"])

  return (
    <a
      onMouseEnter={() => play("click2")}
      class={buttonClass({
        hue: props.hue,
        kind: props.kind,
        suave: props.suave,
        clickable: true,
      })}
      {...aProps}
    />
  )
}

export function Button(iProps: ButtonProps & JSX.IntrinsicElements["button"]) {
  const [props, buttonProps] = splitProps(iProps, ["hue", "kind", "suave"])

  return (
    <button
      onMouseEnter={() => !buttonProps.disabled && play("click2")}
      class={buttonClass({
        hue: props.hue,
        kind: props.kind,
        suave: props.suave,
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
