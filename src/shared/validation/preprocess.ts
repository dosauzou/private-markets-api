export function toOptionalNumber(value: unknown): unknown {
  if (value === undefined || value === '') return undefined
  if (typeof value === 'string') return Number(value)
  return value
}