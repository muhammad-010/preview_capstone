function createResponsiveStyleClass(config: {
    buildClass: (twPfx: TailwindBreakpointPrefix, cssVar: ResponsiveCssVar) => string
    transform?: (value: string | unknown) => string
}) {
    return (
        key: string,
        cssVariable: ResponsiveCssVar,
        tailwindBreakpoint: TailwindBreakpointPrefix,
    ): ResponsiveStyleClass => {
        return {
            key,
            cssVariable,
            tailwindBreakpoint,
            tailwindClass: config.buildClass(tailwindBreakpoint, cssVariable),
            getValue: config.transform ?? (v => `${v}`),
        }
    }
}

export const backgroundResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}bg-(image:${cssVar})`,
    transform: v => `url(${v})`,
})

export const xPosResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}left-(${cssVar})`,
    transform: v => `${v}%`,
})

export const yPosResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}top-(${cssVar})`,
    transform: v => `${v}%`,
})

export function responsiveStyleClass(bp: Breakpoint, suffix: StylingSuffix): ResponsiveStyleClass {
    const key = `${bp}${suffix}`
    const cssVariable: ResponsiveCssVar = `--${bp}${suffix}`
    const tailwindBreakpoint: TailwindBreakpointPrefix = `${bp}:`

    switch (suffix) {
        case STYLING_BACKGROUND_SUFFIX:
            return backgroundResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_POS_X_SUFFIX:
            return xPosResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_POS_Y_SUFFIX:
            return yPosResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        default:
            return {
                key,
                cssVariable,
                tailwindBreakpoint,
                tailwindClass: '',
                getValue: (value) => {
                    return `${value}`
                },
            }
    }
}
