import { AVATAR_SIZE } from "@/components/avatar"
import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { color } from "@/styles/colors"

export const SOFT_SHADE_FILTER_ID = "soft-shade"
export const SIDE_GRADIENT_ID = "side-gradient"
export const SIDE_FLOWER_GRADIENT_ID = "side-flower-gradient"
export const SIDE_SEASON_GRADIENT_ID = "side-season-gradient"
export const VISIBILITY_MASK_ID = "visibility-mask"
export const AVATAR_MASK_ID = "avatar-mask"
export const BODY_GRADIENT_ID = "body-gradient"
export const FLOWER_BODY_GRADIENT_ID = "flower-body-gradient"
export const SEASON_BODY_GRADIENT_ID = "season-body-gradient"

const VISIBILITY_GRADIENT_ID = "visibility-gradient"

export function Defs() {
  return (
    <svg style={{ position: "absolute" }}>
      <defs>
        <mask
          id={AVATAR_MASK_ID}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
        >
          <rect
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            rx={AVATAR_SIZE * 2}
            fill="#FFFFFF"
          />
        </mask>
        <filter id={SOFT_SHADE_FILTER_ID}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        </filter>

        <linearGradient id={SIDE_GRADIENT_ID} gradientTransform="rotate(45)">
          <stop offset="0%" stop-color="#fc9" />
          <stop offset="73%" stop-color="#eb8" />
          <stop offset="73%" stop-color="#ea6" />
          <stop offset="100%" stop-color="#e95" />
        </linearGradient>

        <linearGradient id={BODY_GRADIENT_ID} gradientTransform="rotate(-45)">
          <stop offset="0%" stop-color={color.tile80} />
          <stop offset="100%" stop-color={color.tile60} />
        </linearGradient>
        <linearGradient
          id={FLOWER_BODY_GRADIENT_ID}
          gradientTransform="rotate(-45)"
        >
          <stop offset="0%" stop-color={color.flower80} />
          <stop offset="100%" stop-color={color.flower60} />
        </linearGradient>
        <linearGradient
          id={SEASON_BODY_GRADIENT_ID}
          gradientTransform="rotate(-45)"
        >
          <stop offset="0%" stop-color={color.season80} />
          <stop offset="100%" stop-color={color.season60} />
        </linearGradient>

        <linearGradient
          id={SIDE_FLOWER_GRADIENT_ID}
          gradientTransform="rotate(45)"
        >
          <stop offset="0%" stop-color={color.flower40} />
          <stop offset="73%" stop-color={color.flower30} />
          <stop offset="73%" stop-color={color.flower20} />
          <stop offset="100%" stop-color={color.flower10} />
        </linearGradient>

        <linearGradient
          id={SIDE_SEASON_GRADIENT_ID}
          gradientTransform="rotate(45)"
        >
          <stop offset="0%" stop-color={color.season40} />
          <stop offset="73%" stop-color={color.season30} />
          <stop offset="73%" stop-color={color.season20} />
          <stop offset="100%" stop-color={color.season10} />
        </linearGradient>

        <linearGradient id={`${VISIBILITY_GRADIENT_ID}`}>
          <stop offset="0%" stop-color="white" stop-opacity="1" />
          <stop offset="30%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0.2" />
        </linearGradient>

        <mask id={VISIBILITY_MASK_ID}>
          <rect
            x={0}
            y={0}
            width={TILE_WIDTH + Math.abs(SIDE_SIZES.xSide) * 4}
            height={TILE_HEIGHT + Math.abs(SIDE_SIZES.ySide) * 4}
            fill={`url(#${VISIBILITY_GRADIENT_ID})`}
          />
        </mask>
      </defs>
    </svg>
  )
}
