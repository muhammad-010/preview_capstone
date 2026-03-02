import type { ISOString } from '../types/data'

const UNITS = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
]

export function formatNumberSuffix(value: number, decimals = 1): string {
    if (value < 1000) return value.toString()

    for (const unit of UNITS) {
        if (value >= unit.value) {
            const num = value / unit.value
            return `${num.toFixed(num % 1 === 0 ? 0 : decimals)}${unit.suffix}`
        }
    }

    return value.toString()
}

/** format date into YYYY-MM-DD */
export function formatShortDate(datestring: ISOString): string {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const yyyy = date.getUTCFullYear()
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
}

/** format date into YYYY-MM-DD at HH:mm */
export function formatLongDate(datestring: ISOString): string {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const yyyy = date.getUTCFullYear()
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')

    const hh = String(date.getUTCHours()).padStart(2, '0')
    const min = String(date.getUTCMinutes()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd} at ${hh}:${min}`
}

/** format date into HH:mm */
export function formatHour(datestring: ISOString) {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const hh = String(date.getUTCHours()).padStart(2, '0')
    const min = String(date.getUTCMinutes()).padStart(2, '0')

    return `${hh}:${min}`
}

export function formatPercentage(
    part: number,
    total: number,
    precision = 2,
): number {
    if (total === 0) return 0

    const result = (part / total) * 100
    const factor = Math.pow(10, precision)

    return Math.round(result * factor) / factor
}
