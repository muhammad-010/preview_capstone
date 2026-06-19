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

const backgroundResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}bg-(image:${cssVar})`,
    transform: v => `url(${v})`,
})

const xPosResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}left-(${cssVar})`,
    transform: v => `${v}%`,
})

const yPosResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}top-(${cssVar})`,
    transform: v => `${v}%`,
})

const colorResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}text-(${cssVar})`,
})

const textAlignResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}[text-align:var(${cssVar})]`,
})

const fontFamilyResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}font-[${cssVar}]`,
})

const fontSizeResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}text-(length:${cssVar})`,
})

const fontWeightResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}font-(${cssVar})`,
})

const fontStyleResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}[font-style:var(${cssVar})]`,
})

const widthResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}w-(${cssVar})`,
})

const heightResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}h-(${cssVar})`,
})

export function findSmallestBreakpoint(bps: Breakpoint[]): Breakpoint {
    if (bps.length === 1) return bps[0] || BREAKPOINT_SM
    return bps.reduce((smallest, cur) => {
        if (!smallest) return cur
        return BREAKPOINTS.indexOf(cur) < BREAKPOINTS.indexOf(smallest)
            ? cur
            : smallest
    }, bps[0] || BREAKPOINT_SM)
}

export function responsiveStyleClass(bp: Breakpoint, suffix: StylingSuffix, isSmallest: boolean, noBreakpoint?: boolean): ResponsiveStyleClass {
    const key = `${bp}${suffix}`
    const cssVariable: ResponsiveCssVar = `--${bp}${suffix}`
    const tailwindBreakpoint: TailwindBreakpointPrefix = noBreakpoint || isSmallest ? '' : `${bp}:`

    switch (suffix) {
        case STYLING_BACKGROUND_SUFFIX:
            return backgroundResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_POS_X_SUFFIX:
            return xPosResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_POS_Y_SUFFIX:
            return yPosResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_COLOR_SUFFIX:
            return colorResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_TEXT_ALIGN_SUFFIX:
            return textAlignResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_FONT_FAMILY_SUFFIX:
            return fontFamilyResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_FONT_SIZE_SUFFIX:
            return fontSizeResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_FONT_WEIGHT_SUFFIX:
            return fontWeightResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_FONT_STYLE_SUFFIX:
            return fontStyleResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_WIDTH_SUFFIX:
            return widthResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
        case STYLING_HEIGHT_SUFFIX:
            return heightResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
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
