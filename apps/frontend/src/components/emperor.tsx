import { type JSX, Show, splitProps } from "solid-js"
import { EMPEROR_HEIGHT, EMPEROR_WIDTH, emperorClass } from "./emperor.css"
import { EmperorHover } from "./game/emperorHover"
import { useHover } from "./game/useHover"

type Props = {
  name: string
  width?: number
  onClick?: () => void
}
export function Emperor(props: Props) {
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })

  return (
    <>
      <EmperorIcon
        {...hoverProps}
        onClick={props.onClick}
        name={props.name}
        width={props.width}
      />

      <Show when={isHovering()}>
        <EmperorHover mousePosition={mousePosition()} name={props.name} />
      </Show>
    </>
  )
}

export function EmperorIcon(
  iProps: { name: string; width?: number } & JSX.IntrinsicElements["img"],
) {
  const [props, imgProps] = splitProps(iProps, ["name", "width"])

  return (
    <img
      src={`/occupations/${props.name}.webp`}
      {...imgProps}
      alt={props.name}
      class={emperorClass}
      width={props.width ?? EMPEROR_WIDTH}
      height={
        props.width
          ? (props.width * EMPEROR_HEIGHT) / EMPEROR_WIDTH
          : EMPEROR_HEIGHT
      }
    />
  )
}
