import { createStore } from "solid-js/store"
import { produce } from "solid-js/store"

export const SHAKE_DURATION = 150
export const MOVE_DURATION = 300
export const SHAKE_REPEAT = 3
export const DELETED_DURATION = 300
export const FLOATING_NUMBER_DURATION = 1_500
export const FALL_DURATION = 300
export const MUTATE_DURATION = 300

const ANIMATIONS = {
  jump: {
    duration: MOVE_DURATION,
  },
  shake: {
    duration: SHAKE_DURATION * SHAKE_REPEAT,
  },
  wind: {
    duration: MOVE_DURATION,
  },
  deleted: {
    duration: FLOATING_NUMBER_DURATION,
  },
  fall: {
    duration: FALL_DURATION,
  },
  mutate: {
    duration: MUTATE_DURATION,
  },
} as const
type Animation = keyof typeof ANIMATIONS
type Animations = Record<
  string,
  {
    name: Animation
    timeout: NodeJS.Timeout
  }
>

export const [animations, setAnimations] = createStore<Animations>({})

export function animate({ id, name }: { id: string; name: Animation }) {
  const currentAnimation = animations[id]
  const duration = ANIMATIONS[name].duration

  if (currentAnimation) {
    clearTimeout(currentAnimation.timeout)
  }

  const timeout = setTimeout(() => {
    setAnimations(
      produce((animations) => {
        delete animations[id]
      }),
    )
  }, duration * 1.2)

  setAnimations(id, { name, timeout })
}
