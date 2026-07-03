/**
 * Smart alignment guides + snapping for EditorV2 (Canva-style).
 *
 * All coordinates are in *canvas* pixels (the unscaled design space). The caller
 * converts the snap threshold from screen px to canvas px (i.e. divides by the
 * canvas zoom) so the snap feel stays constant regardless of zoom.
 */
export interface SnapBox {
    /** center x/y in canvas px */
    cx: number
    cy: number
    w: number
    h: number
}

export interface SnapGuide {
    axis: 'v' | 'h'
    /** position in canvas px along the axis (x for 'v', y for 'h') */
    pos: number
}

export interface SnapResult {
    cx: number
    cy: number
    guides: SnapGuide[]
}

export function useEditorSnapping() {
    function axisTargets(centers: number[], sizes: number[], canvasSize: number): number[] {
        const targets: number[] = [0, canvasSize / 2, canvasSize]
        for (let i = 0; i < centers.length; i++) {
            const c = centers[i]!
            const half = sizes[i]! / 2
            targets.push(c - half, c, c + half)
        }
        return targets
    }

    function snapAxis(
        movingCenter: number,
        movingHalf: number,
        targets: number[],
        threshold: number,
    ): { center: number, guide: number | null } {
        // candidate anchors on the moving box: left edge, center, right edge
        const anchors = [movingCenter - movingHalf, movingCenter, movingCenter + movingHalf]
        let best: { delta: number, center: number, guide: number } | null = null

        for (const anchor of anchors) {
            for (const target of targets) {
                const dist = Math.abs(anchor - target)
                if (dist > threshold) continue
                if (best && dist >= Math.abs(best.delta)) continue
                best = {
                    delta: target - anchor,
                    center: movingCenter + (target - anchor),
                    guide: target,
                }
            }
        }

        if (!best) return { center: movingCenter, guide: null }
        return { center: best.center, guide: best.guide }
    }

    /**
     * Snap the proposed `moving` box against `others` and the canvas bounds.
     * Returns the snapped center and the guide lines to render.
     */
    function snap(
        moving: SnapBox,
        others: SnapBox[],
        canvas: { w: number, h: number },
        threshold: number,
    ): SnapResult {
        const vTargets = axisTargets(others.map(o => o.cx), others.map(o => o.w), canvas.w)
        const hTargets = axisTargets(others.map(o => o.cy), others.map(o => o.h), canvas.h)

        const vx = snapAxis(moving.cx, moving.w / 2, vTargets, threshold)
        const hy = snapAxis(moving.cy, moving.h / 2, hTargets, threshold)

        const guides: SnapGuide[] = []
        if (vx.guide !== null) guides.push({ axis: 'v', pos: vx.guide })
        if (hy.guide !== null) guides.push({ axis: 'h', pos: hy.guide })

        return { cx: vx.center, cy: hy.center, guides }
    }

    return { snap }
}
