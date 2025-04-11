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
      srcset={`/occupations/s/${props.name}.webp 134w,/occupations/m/${props.name}.webp 300w,/occupations/l/${props.name}.webp 500w`}
      sizes="(max-width: 300px) 134px, (max-width: 768px) 300px, 500px"
      src={`/occupations/m/${props.name}.webp`}
      {...imgProps}
      alt={props.name}
    />
  )
}
