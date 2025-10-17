import { Transform } from 'class-transformer'

export function ToBoolean() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const val = value.toLowerCase()
      if (val === 'false' || val === '0') return false
      if (val === 'true' || val === '1') return true
      return Boolean(val)
    }
    if (value === false || value === 0) return false
    if (value === true || value === 1) return true
    return Boolean(value)
  })
}
