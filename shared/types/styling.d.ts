export type Breakpoint = typeof BREAKPOINTS[number]
export type TailwindBreakpointPrefix = typeof TW_BREAKPOINTS[number]

export type StylingSuffix = '-background'
    | '-pos-x'
    | '-pos-y'
    | '-color'
    | '-font-family'
    | '-font-size'
    | '-font-weight'
    | '-font-style'
    | '-width'
    | '-height'
export type BackgroundCssVar = typeof STYLING_BACKGROUNDS[number]
export type XPosCssVar = typeof STYLING_POS_XS[number]
export type YPosCssVar = typeof STYLING_POS_YS[number]
export type ColorCssVar = typeof STYLING_COLORS[number]
export type FontFamilyCssVar = typeof STYLING_FONT_FAMILIES[number]
export type FontSizeCssVar = typeof STYLING_FONT_SIZES[number]
export type FontWeightCssVar = typeof STYLING_FONT_WEIGHTS[number]
export type FontStyleCssVar = typeof STYLING_FONT_STYLES[number]
export type WidthCssVar = typeof STYLING_WIDTHS[number]
export type HeightCssVar = typeof STYLING_HEIGHTS[number]

export type ResponsiveCssVar = BackgroundCssVar
    | XPosCssVar
    | YPosCssVar
    | ColorCssVar
    | FontFamilyCssVar
    | FontSizeCssVar
    | FontWeightCssVar
    | FontStyleCssVar
    | WidthCssVar
    | HeightCssVar

export interface ResponsiveElementSetting {
    tailwindClass: string[]
    style: Partial<Record<
        ResponsiveCssVar | string,
        string
    >>
}

export interface ResponsiveStyling {
    breakpoint: Breakpoint
    cssVar: ResponsiveCssVar
}

export interface ResponsiveStyleClass {
    key: string
    cssVariable: ResponsiveCssVar
    tailwindBreakpoint: TailwindBreakpointPrefix
    tailwindClass: string
    getValue: (value: string | unknown) => string
}
