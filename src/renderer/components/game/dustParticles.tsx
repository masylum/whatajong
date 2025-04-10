import { type Tile, type WindDirection, getRank, isWind } from "@/lib/game"
import { difference } from "@/lib/setMethods"
import { useTileState } from "@/state/tileState"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js"
import {
  animationDelay,
  animationRepeat,
  blur,
  drift,
  duration,
  dustParticle,
  lightRaysContainer,
  opacity,
  scale,
  size,
  startX,
  startY,
  windGustClass,
  zIndex,
} from "./dustParticles.css"

export function DustParticles() {
  const tiles = useTileState()

  const [windDirection, setWindDirection] = createSignal<WindDirection | null>(
    null,
  )
  let windTimeout: ReturnType<typeof setTimeout> | undefined

  onCleanup(() => {
    clearTimeout(windTimeout)
  })

  createEffect(() => {
    const direction = windDirection()
    if (!direction) return

    if (windTimeout) {
      clearTimeout(windTimeout)
    }

    windTimeout = setTimeout(() => {
      setWindDirection(null)
    }, 3_000) // 1s delay + 2s duration. Enough for all snow to fall
  })

  const windTiles = createMemo(() =>
    tiles.filterBy({ deleted: true }).filter((tile) => isWind(tile.card)),
  )
  const hasWind = () => !!windDirection()

  createEffect((prev: Tile[]) => {
    const setTiles = new Set(windTiles())
    const newWindTiles = difference(setTiles, new Set(prev))

    if (newWindTiles.size) {
      const windTile = newWindTiles.values().next().value!
      const direction = getRank(windTile.card) as WindDirection
      setWindDirection(direction)
    }

    return windTiles()
  }, windTiles())

  function getStartPosition(direction: WindDirection | null) {
    const x = Math.random() * 100
    const y = Math.random() * 100

    switch (direction) {
      case "n":
      case "s":
      case null:
        return { x }
      case "e":
      case "w":
        return { y }
    }
  }

  const dustParticles = createMemo(() =>
    Array.from({ length: hasWind() ? 150 : 50 }, () => {
      const z = Math.random() // z ranges from 0 (far) to 1 (near)
      const size = 4 + z * 8 // Size increases with z (4px to 12px)
      const speed = hasWind()
        ? 1000 + (1 - z) * 1000 // 1-2s during wind
        : 2000 + (1 - z) * 4000 // 2-6s normal
      const animationDelay = (hasWind() ? 1 : 10) * Math.random()
      const drift = (Math.random() - 0.5) * (0.2 + Math.random() * 0.6)
      const blur = 2 - z * 1.5
      const opacity = 0.2 + z * 0.6
      const scale = 0.6 + z * 0.6
      const direction = windDirection()
      const startPos = getStartPosition(direction)

      return {
        z,
        size,
        speed,
        startX: startPos.x,
        startY: startPos.y,
        direction,
        drift,
        blur,
        opacity,
        animationDelay,
        animationRepeat: hasWind() ? "1" : "infinite",
        scale,
        zIndex: Math.floor(z * 100) + 1,
      }
    }),
  )

  return (
    <Show when={windDirection()}>
      {(windDirection) => (
        <div class={lightRaysContainer}>
          <div class={windGustClass({ direction: windDirection()! })} />
          <For each={dustParticles()}>
            {(particle) => {
              return (
                <div
                  class={dustParticle({
                    direction: particle.direction ?? "default",
                  })}
                  style={{
                    ...assignInlineVars({
                      [startX]: `${particle.startX}vw`,
                      [startY]: `${particle.startY}vh`,
                      [size]: `${particle.size}px`,
                      [duration]: `${particle.speed}ms`,
                      [drift]: `${particle.drift}`,
                      [blur]: `${particle.blur}px`,
                      [opacity]: `${particle.opacity}`,
                      [animationDelay]: `${particle.animationDelay}s`,
                      [scale]: `${particle.scale}`,
                      [zIndex]: `${particle.zIndex}`,
                      [animationRepeat]: particle.animationRepeat,
                    }),
                  }}
                />
              )
            }}
          </For>
        </div>
      )}
    </Show>
  )
}
