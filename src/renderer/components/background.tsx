import { pick } from "@/lib/rand"
import { type ParentProps, createMemo } from "solid-js"
import {
  backgroundClass,
  containerClass,
  mountainsClass,
  textureClass,
} from "./background.css"

type Num = 0 | 1 | 2 | 3 | 4 | 5
const FILTERS = ["r", "g", "b", "k"] as const
export function Background(props: { num?: number } & ParentProps) {
  const textureNum = createMemo(
    () => (Math.floor(Math.random() * 4) + 1) as Num,
  )
  const mountainsNum = createMemo(
    () => (Math.floor(Math.random() * 4) + 1) as Num,
  )

  const filter = createMemo(() => pick(FILTERS))

  return (
    <div class={backgroundClass}>
      <div
        class={textureClass({
          num: textureNum(),
          filter: filter(),
        })}
      />
      <div class={containerClass}>{props.children}</div>
      <Mountains num={mountainsNum()} />
    </div>
  )
}

export function Mountains(iProps: { num: Num }) {
  return <div class={mountainsClass({ num: iProps.num })} />
}
