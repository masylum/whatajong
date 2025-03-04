export function difference<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((item) => !b.has(item)))
}

export function intersection<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((item) => b.has(item)))
}
