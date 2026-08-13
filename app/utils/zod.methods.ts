import * as z from 'zod'

export function zodEnum(enums: string[]) {
    return z.enum(enums)
}

export function zodNumberRequired(msg?: string) {
    return z
        .number(msg)
}

export function zodNumberOptional() {
    return z
        .number()
        .optional()
}

export function zodBooleanRequired() {
    return z
        .boolean()
}

export function zodStringRequired(msg: string) {
    return z
        .string()
        .min(1, msg)
}

export function zodStringOptional() {
    return z
        .string()
        .optional()
}

export function zodEmailRequired() {
    return z
        .email('Invalid email')
}

export function zodPhoneNumberRequired() {
    return z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(13, 'Phone number can not be more than 13 digits')
        .regex(/^0\d+$/, 'Phone number must start with 0 and contain only digits')
}

export function zodISODatetime() {
    return z.iso
        .datetime()
}

export function zodArrayNumberRequired(msg?: string) {
    return z.array(z.number()).min(1, msg ?? 'At least one item is required')
}

export function zodArrayNumber() {
    return z.array(z.number())
}

export function zodPasswordOptional() {
    return z
        .string()
        .min(8, 'Minimum 8 characters')
        .optional()
}
