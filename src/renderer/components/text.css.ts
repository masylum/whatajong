import { style } from "@vanilla-extract/css"
import { type RecipeVariants, recipe } from "@vanilla-extract/recipes"
import {
  ANIMATION_SLOW,
  FALLING_NUMBER_DURATION,
  easeBounce,
  fallingNumber,
  floatAnimation,
  fromAboveAnimation,
  mildFloatAnimation,
} from "../styles/animations.css"

export const containerClass = style({
  display: "inline-flex",
})

export const letterClass = recipe({
  base: {},
  variants: {
    animation: {
      mildFloating: {
        animation: `${mildFloatAnimation} 4s infinite ease-in-out`,
      },
      floating: {
        animation: `${floatAnimation} 4s infinite ease-in-out`,
      },
      fromAbove: {
        animation: `${fromAboveAnimation} ${ANIMATION_SLOW} ${easeBounce}`,
      },
      fallingNumber: {
        animation: `${fallingNumber} ${FALLING_NUMBER_DURATION}ms ${easeBounce}`,
      },
    },
  },
})

export type LetterVariants = RecipeVariants<typeof letterClass>
