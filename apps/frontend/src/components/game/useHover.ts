import { createSignal, onCleanup } from "solid-js"
import type { Accessor } from "solid-js"
import { useMousePosition } from "@solid-primitives/mouse"

type UseHoverOptions = {
  delay?: number
}

type UseHoverResult = {
  isHovering: () => boolean
  hoverProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
  }
  mousePosition: Accessor<{ x: number; y: number }>
}

export function useHover(options?: UseHoverOptions): UseHoverResult {
  const delay = options?.delay ?? 0
  const [isHovering, setIsHovering] = createSignal(false)
  const pos = useMousePosition()

  let hoverTimeout: number | null = null

  function clearHoverTimeout() {
    if (hoverTimeout !== null) {
      window.clearTimeout(hoverTimeout)
      hoverTimeout = null
    }
  }

  onCleanup(() => {
    clearHoverTimeout()
  })

  function handleMouseEnter() {
    clearHoverTimeout()

    if (delay > 0) {
      hoverTimeout = window.setTimeout(() => {
        setIsHovering(true)
      }, delay)
    } else {
      setIsHovering(true)
    }
  }

  function handleMouseLeave() {
    clearHoverTimeout()

    // Small delay to prevent flickering when moving between elements
    hoverTimeout = window.setTimeout(() => {
      setIsHovering(false)
    }, 50)
  }

  function handleFocus() {
    handleMouseEnter()
  }

  function handleBlur() {
    handleMouseLeave()
  }

  // Create an accessor function that returns the current mouse position
  const mousePosition = () => ({ x: pos.x, y: pos.y })

  return {
    isHovering,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    mousePosition,
  }
}
