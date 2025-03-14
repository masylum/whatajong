import { emperorClass } from "./emperor.css"

export function Emperor(props: { name: string }) {
  return <div class={emperorClass}>{props.name.replaceAll("_", " ")}</div>
}
