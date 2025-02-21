import { AVATAR_SIZE } from "@/components/avatar"
import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "../state"
import { colors } from "@/components/colors"

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
    <svg style={{ width: 0, height: 0 }}>
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
          <stop offset="0%" stop-color={colors.tile80} />
          <stop offset="100%" stop-color={colors.tile60} />
        </linearGradient>
        <linearGradient
          id={FLOWER_BODY_GRADIENT_ID}
          gradientTransform="rotate(-45)"
        >
          <stop offset="0%" stop-color={colors.flowerTile80} />
          <stop offset="100%" stop-color={colors.flowerTile60} />
        </linearGradient>
        <linearGradient
          id={SEASON_BODY_GRADIENT_ID}
          gradientTransform="rotate(-45)"
        >
          <stop offset="0%" stop-color={colors.seasonTile80} />
          <stop offset="100%" stop-color={colors.seasonTile60} />
        </linearGradient>

        <linearGradient
          id={SIDE_FLOWER_GRADIENT_ID}
          gradientTransform="rotate(45)"
        >
          <stop offset="0%" stop-color={colors.flowerTile40} />
          <stop offset="73%" stop-color={colors.flowerTile30} />
          <stop offset="73%" stop-color={colors.flowerTile20} />
          <stop offset="100%" stop-color={colors.flowerTile10} />
        </linearGradient>

        <linearGradient
          id={SIDE_SEASON_GRADIENT_ID}
          gradientTransform="rotate(45)"
        >
          <stop offset="0%" stop-color={colors.seasonTile40} />
          <stop offset="73%" stop-color={colors.seasonTile30} />
          <stop offset="73%" stop-color={colors.seasonTile20} />
          <stop offset="100%" stop-color={colors.seasontTile10} />
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
