import { isDeepEqual } from "remeda"
import { For, createMemo, mergeProps } from "solid-js"
import { type LetterVariants, containerClass, letterClass } from "./text.css"

type TextProps = {
  children: string | number
} & LetterVariants

export function Text(iProps: TextProps) {
  const props = mergeProps({ animation: "mildFloating" } as const, iProps)

  function splitText(text: string | number) {
    return text
      .toString()
      .split("")
      .map((char) => ({ char, text }))
  }

  const letters = createMemo(
    () => splitText(props.children),
    splitText(props.children),
    { equals: isDeepEqual },
  )

  return (
    <div class={containerClass}>
      <For each={letters()}>
        {(letter, index) => (
          <span
            class={letterClass({ animation: props.animation })}
            style={{
              "animation-delay": `${index() * 0.1}s`,
            }}
          >
            {letter.char}
          </span>
        )}
      </For>
    </div>
  )
}
