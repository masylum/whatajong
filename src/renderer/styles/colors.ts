import type { Material } from "@/lib/game"
import type { Color as GameColor } from "@/lib/game"

const huesAndShades = {
  base: {
    "0": "oklch(99.85% 0.002 85)",
    "1000": "oklch(12% 0.003 85)",
  },

  bam: {
    90: "#e7f7e7",
    80: "#c7f4c7",
    70: "#a4e5a3",
    60: "#7ac077",
    50: "#3b9a36",
    40: "#005700",
    30: "#043a03",
    20: "#082107",
    10: "#001300",
  },

  crack: {
    90: "#fcf0ee",
    80: "#fdddd8",
    70: "#fdc1b9",
    60: "#f08d83",
    50: "#d94b44",
    40: "#84090b",
    30: "#58110f",
    20: "#3b0306",
    10: "#240105",
  },

  dot: {
    90: "#ecf3fd",
    80: "#d9e7fc",
    70: "#b7d4fc",
    60: "#7faeed",
    50: "#2c80ef",
    40: "#004192",
    30: "#052c63",
    20: "#011a41",
    10: "#010d26",
  },

  bone: {
    90: "#fef1d4",
    80: "#fee1b7",
    70: "#f8bb73",
    60: "#f3a04e",
    50: "#e4843f",
    40: "#b86544",
    30: "#7a3b2e",
    20: "#49211b",
    10: "#1a0805",
  },

  black: {
    90: "#f6f3ec",
    80: "#eae7dc",
    70: "#d7d3c4",
    60: "#b3ad9b",
    50: "#888272",
    40: "#4c4635",
    30: "#352e1e",
    20: "#221c0b",
    10: "#120e05",
  },
} as const

const accentHues = ["bam", "crack", "dot", "bone", "black"] as const

export function hueFromColor(color: GameColor) {
  return (
    {
      r: "crack",
      g: "bam",
      b: "dot",
      k: "black",
    } as const
  )[color]
}

export function hueFromMaterial(material: Material) {
  return (
    {
      bone: "bone",
      topaz: "dot",
      sapphire: "dot",
      garnet: "crack",
      ruby: "crack",
      jade: "bam",
      emerald: "bam",
      quartz: "black",
      obsidian: "black",
    } as const
  )[material]
}

type Hue = keyof typeof huesAndShades
export type AccentHue = (typeof accentHues)[number]
type BaseHue = Exclude<Hue, AccentHue>
export type ShadeTypes<H extends Hue> = keyof (typeof huesAndShades)[H]

type BaseColor = `${BaseHue}${ShadeTypes<BaseHue>}`
type AccentColor = `${AccentHue}${ShadeTypes<AccentHue>}`
type Color = BaseColor | AccentColor

const flatten: { [key: string]: string } = {}

for (const hue in huesAndShades) {
  for (const shade in huesAndShades[hue as Hue]) {
    const shades = huesAndShades[hue as Hue] as any
    flatten[`${hue}${shade}`] = shades[shade] as string
  }
}
export const color = flatten as Record<Color, string>

function colorize(hue: AccentHue, shade: ShadeTypes<AccentHue>) {
  return `${hue}${shade}` as AccentColor
}

export function hueVariants<T>(map: (fn: HueShadeGetter, hue: AccentHue) => T) {
  return accentHues.reduce(
    (acc, hue) => {
      acc[hue] = map(getHueColor(hue), hue)
      return acc
    },
    {} as { [K in AccentHue]: T },
  )
}

export function hueSelectors<T>(
  keyMap: (hue: AccentHue) => string,
  valueMap: (fn: HueShadeGetter, hue: AccentHue) => T,
) {
  return accentHues.reduce(
    (acc, hue) => {
      acc[keyMap(hue)] = valueMap(getHueColor(hue), hue)
      return acc
    },
    {} as Record<string, T>,
  )
}

export function alpha(colorName: string, alpha: number) {
  const r = Number.parseInt(colorName.slice(1, 3), 16)
  const g = Number.parseInt(colorName.slice(3, 5), 16)
  const b = Number.parseInt(colorName.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type HueShadeGetter = (shade: ShadeTypes<AccentHue>) => string

export function getHueColor(hue: AccentHue): HueShadeGetter {
  return (shade: ShadeTypes<AccentHue>) => color[colorize(hue, shade)]
}
