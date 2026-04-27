/* eslint-disable @typescript-eslint/no-explicit-any */
export function percentToPx(n: number, size: number) {
    return (n / 100) * size
}

export function pxToPercent(n: number, size: number) {
    return (n / size) * 100
}

export function cloneObject(target: any) {
    return structuredClone(toRaw(target))
}
