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

const fontSizeResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}text-(length:${cssVar})`,
})

const fontWeightResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}font-(${cssVar})`,
})

const fontStyleResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}[font-style:${cssVar}]`,
})

const widthResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}w-(${cssVar})`,
})

const heightResponsiveStyleClass = createResponsiveStyleClass({
    buildClass: (twPfx, cssVar) => `${twPfx}h-(${cssVar})`,
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
        case STYLING_COLOR_SUFFIX:
            return colorResponsiveStyleClass(key, cssVariable, tailwindBreakpoint)
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
