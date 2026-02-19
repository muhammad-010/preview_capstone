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
export function formatShortDate(datestring: string): string {
    if (!datestring) {
        return 'Invalid Date'
    }
    return new Date(datestring).toISOString().split('T')[0] || 'Invalid Date'
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
