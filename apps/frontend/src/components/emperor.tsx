import { type JSX, splitProps } from "solid-js"
import { emperorClass } from "./emperor.css"

export function BasicEmperor(
  iProps: {
    name: string
  } & JSX.IntrinsicElements["img"],
) {
  const [props, imgProps] = splitProps(iProps, ["name"])
  return (
    <img
      srcset={`/occupations/m/${props.name}.webp 300w, /occupations/l/${props.name}.webp 514w`}
      sizes="(min-width: 1024px) 514px, 300px"
      src={`/occupations/m/${props.name}.webp`}
      class={emperorClass}
      {...imgProps}
      alt={props.name}
    />
  )
}
