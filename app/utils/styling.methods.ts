export function backgroundResponsiveStyleClass(key: string, cssVariable: ResponsiveCssVar, tailwindBreakpoint: TailwindBreakpointPrefix): ResponsiveStyleClass {
    return {
        key,
        cssVariable,
        tailwindBreakpoint,
        tailwindClass: `${tailwindBreakpoint}bg-(image:${cssVariable})`,
        getValue: (value) => {
            return `url(${value})`
        },
    }
}

export function responsiveStyleClass(bp: Breakpoint, suffix: StylingSuffix): ResponsiveStyleClass {
    const key = `${bp}${suffix}`
    const cssVariable: ResponsiveCssVar = `--${bp}${suffix}`
    const tailwindBreakpoint: TailwindBreakpointPrefix = `${bp}:`

    switch (suffix) {
        case STYLING_BACKGROUND_SUFFIX:
            return backgroundResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
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
