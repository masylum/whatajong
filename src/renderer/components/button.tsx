import type { AccentHue } from "@/styles/colors"
import { type JSX, splitProps } from "solid-js"
import { play } from "./audio"
import { buttonClass, shopButtonClass } from "./button.css"

type ButtonProps = {
  hue: AccentHue
  suave?: boolean
}

export function LinkButton(iProps: ButtonProps & JSX.IntrinsicElements["a"]) {
  const [props, aProps] = splitProps(iProps, ["hue", "suave"])

  return (
    <a
      onPointerDown={() => play("click2")}
      class={buttonClass({
        hue: props.hue,
        suave: props.suave,
        clickable: true,
      })}
      {...aProps}
    />
  )
}

export function Button(iProps: ButtonProps & JSX.IntrinsicElements["button"]) {
  const [props, buttonProps] = splitProps(iProps, ["hue", "suave"])

  return (
    <button
      onPointerDown={() => !buttonProps.disabled && play("click2")}
      class={buttonClass({
        hue: props.hue,
        suave: props.suave,
        clickable: !!buttonProps.onPointerDown,
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
      onPointerDown={() =>
        !buttonProps.disabled && buttonProps.onPointerDown && play("click2")
      }
      class={shopButtonClass({
        hue: props.hue,
        clickable: !!buttonProps.onPointerDown,
      })}
      {...buttonProps}
    />
  )
}
