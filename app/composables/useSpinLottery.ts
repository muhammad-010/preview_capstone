interface Option {
    /** Target column element (reel wrapper) */
    el: Element | ComponentPublicInstance | null | undefined

    /** Reel stop position */
    finalPos: number

    /**
     * How FAR reel spin
     *
     * Affect spin speed along with duration
     */
    startOffset: number

    /** Total reel's height */
    height: number

    /**
     * Reel stop duration
     *
     * Uses baseDuration and delayDuration
     *
     * Affect spin speed along with startOffset
     */
    duration: number

    /** Is reel finished spin */
    isFinished: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSpinLottery(winner: ComputedRef<string>, list: string[], emitter: (event: 'lottery-done', ...args: any[]) => void, colLen: number = 1) {
    /** Render double list for infinite loop illusion effect */
    const cols = computed(() => Array.from({ length: colLen }, () =>
        [...list, ...list],
    ))

    /** Current scroll position for each cols (vertical offset) */
    const offsets = ref<number[]>(cols.value.map(() => 0))

    /** Ref for reel's element */
    const slotRefs = ref<(Element | ComponentPublicInstance | null)[]>([])

    /** Animation options */
    let opts: Option[] = []

    /** Animation start time */
    let startedAt: number | null = null

    /** Base animation duration */
    const baseDuration = 3000

    /**
     * Delay animation duration
     *
     * Set to 0 to make all column stop at the same time
     *
     * (only takes effect if colLen > 1)
     */
    const delayDuration = 1200

    /** Base offset (spin distance) */
    const baseOffset = 6000

    /** Random offset
     *
     * Create randomness between 0 - 2000px
    */
    const randOffset = 2000

    /**
     * Delay offset
     *
     * Creates sequential stop effect
     */
    const delayOffset = 1500

    const next = (cb: FrameRequestCallback) => {
        if (import.meta.client) return requestAnimationFrame(cb)
        return setTimeout(cb, 1000 / 60)
    }

    function getHeight(el: Element | ComponentPublicInstance | null | undefined) {
        /** 192 = hardcoded based on tailwindcss's h-48 */
        if (!el) return 192

        const elem = el instanceof Element
            ? el
            : (el.$el as Element)
        return (elem.children[0] as HTMLElement).clientHeight
    }

    function spin() {
        if (opts.length) return

        /**
         * Use list instead of cols
         *
         * since cols has duplicate values (for infinite loop illusion effect)
         * finding choice index and calculating height should be using list
         */

        opts = cols.value.map((col, i) => {
            const choice = colLen === 1
                ? list.indexOf(winner.value)
                : list.indexOf(winner.value[i]!)
            const el = slotRefs.value[i]
            const elHeight = getHeight(el)

            /**
             * Controlling spin speed
             *
             * If startOffset longer than duration, it goes faster
             *
             * If duration longer than startOffset, it goes slower
            */

            return {
                el,
                finalPos: choice * elHeight,
                startOffset: baseOffset + (Math.random() * randOffset) + (i * delayOffset),
                height: list.length * elHeight,
                duration: baseDuration + i * delayDuration,
                isFinished: false,
            } as Option
        })

        next(animate)
    }

    function animate(timestamp: number) {
        if (startedAt === null) startedAt = timestamp

        const elapsed = timestamp - startedAt

        opts.forEach((opt, i) => {
            if (opt.isFinished) return

            /**
             * Animation progress
             *
             * 0 = start
             *
             * 1 = finished
            */
            const progress = Math.min(elapsed / opt.duration, 1)

            /**
             * Control easing effect
             *
             * more power = longer ease-out
             *
             * set 1 to make it linear
             */
            const power = 2.2

            /** Easing effect */
            const easing = Math.pow(1 - progress, power)

            /** Calculate position */
            let pos = opt.finalPos + opt.startOffset * easing

            /**
             * Wrap the reel
             *
             * create infinite loop effect
             *
             * Must be paired with double render from cols to create smooth effect
             */
            pos %= opt.height

            /** Update visual offset */
            offsets.value[i] = -Math.floor(pos)

            if (progress >= 1) {
                opt.isFinished = true

                /** Snap to winner's position */
                offsets.value[i] = -opt.finalPos
            }
        })

        if (opts.every(o => o.isFinished)) {
            opts = []
            startedAt = null
            emitter(EMIT_LOTTERY_DONE)
        }
        else {
            next(animate)
        }
    }

    return {
        cols,
        offsets,
        slotRefs,
        spin,
    }
}
