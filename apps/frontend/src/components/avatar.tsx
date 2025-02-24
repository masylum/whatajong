import { AVATAR_MASK_ID } from "@/components/game/defs"

export const AVATAR_SIZE = 36

type AvatarProps = {
  name: string
  colors: readonly string[]
  title?: string
  square?: boolean
  size?: number
}
export function Avatar(props: AvatarProps) {
  const data = generateData(props.name, props.colors)

  return (
    <svg
      viewBox={`0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}`}
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
    >
      <title>{props.name}</title>
      <g mask={`url(#${AVATAR_MASK_ID})`}>
        <rect
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          fill={data.backgroundColor}
        />
        <rect
          x="0"
          y="0"
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          transform={`
            translate(${data.wrapperTranslateX} ${data.wrapperTranslateY})
            rotate(${data.wrapperRotate} ${AVATAR_SIZE / 2} ${AVATAR_SIZE / 2})
            scale(${data.wrapperScale})
          `}
          fill={data.wrapperColor}
          rx={AVATAR_SIZE}
        />
        <g
          transform={`
            translate(${data.faceTranslateX} ${data.faceTranslateY})
            rotate(${data.faceRotate} ${AVATAR_SIZE / 2} ${AVATAR_SIZE / 2})
          `}
        >
          {data.isMouthOpen ? (
            <path
              d={`M 15 ${19 + data.mouthSpread} c2 1 4 1 6 0`}
              stroke={data.faceColor}
              fill="none"
              stroke-linecap="round"
            />
          ) : (
            <path
              d={`M 13 ${19 + data.mouthSpread} a1,0.75 0 0,0 10,0`}
              fill={data.faceColor}
            />
          )}
          <rect
            x={14 - data.eyeSpread}
            y={14}
            width={1.5}
            height={2}
            rx={1}
            stroke="none"
            fill={data.faceColor}
          />
          <rect
            x={20 + data.eyeSpread}
            y={14}
            width={1.5}
            height={2}
            rx={1}
            stroke="none"
            fill={data.faceColor}
          />
        </g>
      </g>
    </svg>
  )
}

function hashCode(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const character = name.charCodeAt(i)
    hash = (hash << 5) - hash + character
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function getRandomColor(
  number: number,
  colors: readonly string[],
  range: number,
) {
  return colors[number % range]!
}

function getDigit(number: number, ntn: number) {
  return Math.floor((number / 10 ** ntn) % 10)
}

function getUnit(number: number, range: number, index?: number) {
  const value = number % range

  if (index && getDigit(number, index) % 2 === 0) {
    return -value
  }

  return value
}

function getBoolean(number: number, ntn: number) {
  return !(getDigit(number, ntn) % 2)
}

function getContrast(hexcolor: string) {
  // If a leading # is provided, remove it
  const color = hexcolor.startsWith("#") ? hexcolor.slice(1) : hexcolor

  // Convert to RGB value
  const r = Number.parseInt(color.substring(0, 2), 16)
  const g = Number.parseInt(color.substring(2, 4), 16)
  const b = Number.parseInt(color.substring(4, 6), 16)

  // Get YIQ ratio
  const yiq = (r * 299 + g * 587 + b * 114) / 1000

  // Check contrast
  return yiq >= 128 ? "#000000" : "#FFFFFF"
}

function generateData(name: string, colors: readonly string[]) {
  const numFromName = hashCode(name)
  const range = colors.length
  const wrapperColor = getRandomColor(numFromName, colors, range)
  const preTranslateX = getUnit(numFromName, 10, 1)
  const wrapperTranslateX =
    preTranslateX < 5 ? preTranslateX + AVATAR_SIZE / 9 : preTranslateX
  const preTranslateY = getUnit(numFromName, 10, 2)
  const wrapperTranslateY =
    preTranslateY < 5 ? preTranslateY + AVATAR_SIZE / 9 : preTranslateY

  const data = {
    wrapperColor: wrapperColor,
    faceColor: getContrast(wrapperColor),
    backgroundColor: getRandomColor(numFromName + 13, colors, range),
    wrapperTranslateX: wrapperTranslateX,
    wrapperTranslateY: wrapperTranslateY,
    wrapperRotate: getUnit(numFromName, 360),
    wrapperScale: 1 + getUnit(numFromName, AVATAR_SIZE / 12) / 10,
    isMouthOpen: getBoolean(numFromName, 2),
    eyeSpread: getUnit(numFromName, 5),
    mouthSpread: getUnit(numFromName, 3),
    faceRotate: getUnit(numFromName, 10, 3),
    faceTranslateX:
      wrapperTranslateX > AVATAR_SIZE / 6
        ? wrapperTranslateX / 2
        : getUnit(numFromName, 8, 1),
    faceTranslateY:
      wrapperTranslateY > AVATAR_SIZE / 6
        ? wrapperTranslateY / 2
        : getUnit(numFromName, 7, 2),
  }

  return data
}
