import { For } from "solid-js"
import { dustParticle, lightRaysContainer } from "./dustParticles.css"

export function LightEffects() {
  const dustParticles = Array.from({ length: 50 })

  return (
    <div class={lightRaysContainer}>
      <For each={dustParticles}>
        {(_) => (
          <div
            class={dustParticle}
            style={{
              "--x": `${Math.random() * 100}vw`,
              "animation-duration": `${3 + Math.random() * 3}s`,
              "animation-delay": `${Math.random() * 6}s`,
            }}
          />
        )}
      </For>
    </div>
  )
}
