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
