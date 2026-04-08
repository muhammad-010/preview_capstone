export function percentToPx(n: number, size: number) {
    return (n / 100) * size
}

export function pxToPercent(n: number, size: number) {
    return (n / size) * 100
}
