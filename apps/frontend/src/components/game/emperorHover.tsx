import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { Portal } from "solid-js/web"
import {
  tooltipClass,
  emperorContainerClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  detailInfoClass,
} from "./emperorHover.css"
import type { JSX } from "solid-js"
import { getEmperors, type Emperor } from "@/state/emperors"
import { EmperorIcon } from "../emperor"

type MousePosition = { x: number; y: number }
type EmperorHoverProps = {
  mousePosition: MousePosition
  name: string
}

export function EmperorHover(props: EmperorHoverProps) {
  const emperor = createMemo(() =>
    getEmperors().find((emperor) => emperor.name === props.name),
  )

  return (
    <Show when={emperor()}>
      {(emperor) => (
        <EmperorDetails
          emperor={emperor()}
          mousePosition={props.mousePosition}
        />
      )}
    </Show>
  )
}

type EmperorDetailsProps = {
  mousePosition: MousePosition
  emperor: Emperor
}
const VERTICAL_OFFSET = 30

function EmperorDetails(props: EmperorDetailsProps) {
  const [tooltipEl, setTooltipEl] = createSignal<HTMLDivElement>()

  const initialStyle: JSX.CSSProperties = {
    position: "fixed" as const,
    top: "0",
    left: "0",
    transition: "opacity 0.15s ease-out",
  }

  createEffect(() => {
    const tooltip = tooltipEl()
    if (!tooltip) return

    const { x, y } = props.mousePosition

    const rect = tooltip.getBoundingClientRect()
    let newX = x - rect.width / 2
    let newY = y - rect.height - VERTICAL_OFFSET

    const viewportWidth = window.innerWidth

    if (newX < 0) {
      newX = 0
    } else if (newX + rect.width > viewportWidth) {
      newX = viewportWidth - rect.width
    }

    if (newY < 0) {
      newY = y + VERTICAL_OFFSET
    }

    tooltip.style.transform = `translate3d(${newX}px, ${newY}px, 1px)`
  })

  const name = createMemo(() => props.emperor.name)
  const description = createMemo(() => props.emperor.description ?? "")
  const level = createMemo(() => props.emperor.level)

  return (
    <Portal>
      <div ref={setTooltipEl} class={tooltipClass} style={initialStyle}>
        <EmperorIcon name={name()} />
        <div class={emperorContainerClass}>
          <span>{name().replaceAll("_", " ")}</span>

          <div class={detailInfoClass}>{description()}</div>

          <Show when={level()}>
            <dl class={detailListClass({ hue: "bone" })}>
              <dt class={detailTermClass}>Level:</dt>
              <dd class={detailDescriptionClass}>{level()}</dd>
            </dl>
          </Show>
        </div>
      </div>
    </Portal>
  )
}
