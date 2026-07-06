import type { ISOString, CustomAttribute } from '../types/data'

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

    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
}

/** format date into YYYY-MM-DD at HH:mm */
export function formatLongDate(datestring: ISOString): string {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd} at ${hh}:${min}`
}

/** format date into HH:mm */
export function formatHour(datestring: ISOString) {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')

    return `${hh}:${min}`
}

/**
 * format date into YYYY-MM-DDTHH:mm:ss+hh:mm
 *
 * uses getUTC<*>() since FE input doesn't have timezone
 * */
export function formatISOWithOffset(datestring: ISOString) {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string')
    }

    const year = date.getUTCFullYear()
    const month = padNumber(date.getUTCMonth() + 1)
    const day = padNumber(date.getUTCDate())

    const hours = padNumber(date.getUTCHours())
    const minutes = padNumber(date.getUTCMinutes())
    const seconds = padNumber(date.getUTCSeconds())
    const ms = padNumber(date.getUTCMilliseconds(), 3)

    const offset = -date.getTimezoneOffset()
    const sign = offset >= 0 ? '+' : '-'
    const offsetHours = padNumber(Math.floor(Math.abs(offset) / 60))
    const offsetMinutes = padNumber(Math.abs(offset) % 60)

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetHours}:${offsetMinutes}`
}

/**
 * format date into YYYY-MM-DDTHH:mm:ssZ
 * */
export function formatISOWithoutOffset(datestring: ISOString) {
    if (!datestring) return 'Invalid Date'

    const date = new Date(datestring)
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string')
    }

    return date.toISOString().split('.')[0] + 'Z'
}

export function getISODateArray(iso: ISOString): [number, number, number] {
    const d = new Date(iso)
    return [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    ]
}

export function getISOHourArray(iso: ISOString): [number, number, number] {
    const d = new Date(iso)
    return [
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
    ]
}

export function padNumber(n: number, z: number = 2) {
    return ('00' + n).slice(-z)
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

export function formatCapitalize(s: string) {
    return s.length <= 0
        ? s
        : s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatCapitalizeAll(s: string, sep: string) {
    return s.length <= 0
        ? s
        : s.split(sep).map(v => formatCapitalize(v))
}

export function formatCleanCustomAttribute(raw: CustomAttribute[]): CustomAttribute[] {
    return raw.filter(attr => attr.value)
}

export function formatNumberStringToNumber(value: string, fallback?: number): number {
    if (/^\d+$/.test(value)) {
        return Number(value)
    }
    return fallback ? fallback : 0
}

export function getCurrencyFormatter(currency?: string): Intl.NumberFormat {
    if (!currency || currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        })
    }

    switch (currency.toUpperCase()) {
        case 'USD':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            })

        case 'EUR':
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
            })

        case 'JPY':
            return new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY',
            })

        case 'SGD':
            return new Intl.NumberFormat('en-SG', {
                style: 'currency',
                currency: 'SGD',
            })

        default:
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            })
    }
}
