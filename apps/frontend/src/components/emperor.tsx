import { type JSX, Show, splitProps } from "solid-js"
import { emperorClass } from "./emperor.css"
import { EmperorHover } from "./game/emperorHover"
import { useHover } from "./game/useHover"

type Props = {
  name: string
  onClick?: () => void
}
export function Emperor(props: Props) {
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })

  return (
    <>
      <EmperorIcon {...hoverProps} onClick={props.onClick} name={props.name} />

      <Show when={isHovering()}>
        <EmperorHover mousePosition={mousePosition()} name={props.name} />
      </Show>
    </>
  )
}

export function EmperorIcon(
  iProps: { name: string } & JSX.IntrinsicElements["img"],
) {
  const [props, imgProps] = splitProps(iProps, ["name"])

  return (
    <img
      src={`/occupations/${props.name}.webp`}
      {...imgProps}
      alt={props.name}
      class={emperorClass}
    />
  )
}
