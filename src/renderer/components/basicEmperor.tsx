import { type JSX, splitProps } from "solid-js"

export const EMPEROR_RATIO = 2 / 3

export function BasicEmperor(
  iProps: {
    name: string
  } & JSX.IntrinsicElements["img"],
) {
  const [props, imgProps] = splitProps(iProps, ["name"])
  return (
    <img
      srcset={`/occupations/m/${props.name}.webp 300w, /occupations/s/${props.name}.webp 134w`}
      sizes="(min-width: 1024px) 300px, 134px"
      src={`/occupations/m/${props.name}.webp`}
      {...imgProps}
      alt={props.name}
    />
  )
}
