import * as z from 'zod'

export function zodEnum(enums: string[]) {
    return z.enum(enums)
}

export function zodNumberRequired() {
    return z
        .number()
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
        .min(12, 'Phone number must be at least 12 digits')
        .max(12, 'Phone number can not be more than 12 digits')
        .regex(/^0\d+$/, 'Phone number must start with 0 and contain only digits')
}

export function zodISODatetime() {
    return z.iso
        .datetime()
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
