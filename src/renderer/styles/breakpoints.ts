export const breakpoints = {
  xxs: "0px",
  xs: "400px",
  s: "540px",
  m: "640px",
  l: "768px",
  xl: "1024px",
  xxl: "1280px",
} as const

const widthQueries = {
  xxs: `(width >= ${breakpoints.xxs})`,
  xs: `(width >= ${breakpoints.xs})`,
  s: `(width >= ${breakpoints.s})`,
  m: `(width >= ${breakpoints.m})`,
  l: `(width >= ${breakpoints.l})`,
  xl: `(width >= ${breakpoints.xl})`,
  xxl: `(width >= ${breakpoints.xxl})`,
} as const

export const heightQueries = {
  xxs: `(height >= ${breakpoints.xxs})`,
  xs: `(height >= ${breakpoints.xs})`,
  s: `(height >= ${breakpoints.s})`,
  m: `(height >= ${breakpoints.m})`,
  l: `(height >= ${breakpoints.l})`,
  xl: `(height >= ${breakpoints.xl})`,
  xxl: `(height >= ${breakpoints.xxl})`,
} as const

type Breakpoint = keyof typeof breakpoints

export function mediaQuery({ p, l }: { p: Breakpoint; l: Breakpoint }) {
  return `
    (orientation: portrait) and ${widthQueries[p]}, (orientation: landscape) and ${heightQueries[l]}
  `
}
