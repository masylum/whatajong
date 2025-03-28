import { splitProps, type JSX } from "solid-js"
import { buttonClass, shopButtonClass } from "./button.css"
import type { AccentHue } from "@/styles/colors"
import { play, SOUNDS } from "./audio"
import { useGlobalState } from "@/state/globalState"

type Kind = "light" | "dark"
type Props = {
  hue: AccentHue
  kind?: Kind
} & JSX.IntrinsicElements["a"]

export function LinkButton(iProps: Props) {
  const globalState = useGlobalState()
  const [props, aProps] = splitProps(iProps, ["hue", "kind"])

  return (
    <a
      onMouseEnter={() => play(SOUNDS.CLICK2, globalState.muted)}
      class={buttonClass({ hue: props.hue, kind: props.kind })}
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
  const globalState = useGlobalState()

  return (
    <button
      onMouseEnter={() => play(SOUNDS.CLICK2, globalState.muted)}
      class={buttonClass({ hue: props.hue, kind: props.kind })}
      {...buttonProps}
    />
  )
}

type ShopButtonProps = {
  hue: AccentHue
} & JSX.IntrinsicElements["button"]
export function ShopButton(iProps: ShopButtonProps) {
  const [props, buttonProps] = splitProps(iProps, ["hue"])
  const globalState = useGlobalState()

  return (
    <button
      onMouseEnter={() => play(SOUNDS.CLICK2, globalState.muted)}
      class={shopButtonClass({ hue: props.hue })}
      {...buttonProps}
    />
  )
}
