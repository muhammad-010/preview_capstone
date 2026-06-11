export const EDITOR_MODE_INVITATION_EMAIL = 'invitation-email'
export const EDITOR_MODE_CHECK_IN_PAGE = 'check-in-page'
export const EDITOR_CANVAS_WIDTH = 600
export const EDITOR_CANVAS_HEIGHT = 1750
export const EDITOR_CANVAS_SCALE = 0.80
export const EDITOR_CANVAS_PORTRAIT = 'portrait'
export const EDITOR_CANVAS_LANDSCAPE = 'landscape'

export const EDITOR_MODE_TEMPLATE_NAME: Record<EditorMode, string> = {
    [EDITOR_MODE_INVITATION_EMAIL]: TEMPLATE_INVITATION,
    [EDITOR_MODE_CHECK_IN_PAGE]: TEMPLATE_SCANQR,
}

export const CANVAS_SIZE_PRESETS_INVITATION_EMAIL: CanvasSize[] = [
    { id: BREAKPOINT_MD, width: 1360, height: 1360, label: 'Square', breakpoint: BREAKPOINT_MD, orientation: EDITOR_CANVAS_PORTRAIT },
]

export const CANVAS_SIZE_PRESETS_CHECK_IN_PAGE: CanvasSize[] = [
    { id: BREAKPOINT_SM, width: 360, height: 640, label: 'Mobile', breakpoint: BREAKPOINT_SM, orientation: EDITOR_CANVAS_PORTRAIT },
    { id: BREAKPOINT_MD, width: 432, height: 768, label: 'Tablet', breakpoint: BREAKPOINT_MD, orientation: EDITOR_CANVAS_PORTRAIT },
    { id: BREAKPOINT_LG, width: 1024, height: 768, label: 'Laptop', breakpoint: BREAKPOINT_LG, orientation: EDITOR_CANVAS_LANDSCAPE },
    { id: BREAKPOINT_XL, width: 1280, height: 720, label: 'Desktop', breakpoint: BREAKPOINT_XL, orientation: EDITOR_CANVAS_LANDSCAPE },
]

export const CHECK_IN_VALID_BREAKPOINTS: Breakpoint[] = [
    BREAKPOINT_SM,
    BREAKPOINT_MD,
    BREAKPOINT_LG,
    BREAKPOINT_XL,
]

export const BLOCK_TEXT_TYPE = 'static-text'
export const BLOCK_IMAGE_TYPE = 'image'
/** With dynamic variable */
export const BLOCK_DYNAMIC_TEXT_TYPE = 'text'
/** With dynamic variable */
export const BLOCK_QR_IMAGE_TYPE = 'qr-image'
export const BLOCK_TYPES: string[] = [
    BLOCK_TEXT_TYPE,
    BLOCK_IMAGE_TYPE,
    BLOCK_DYNAMIC_TEXT_TYPE,
    BLOCK_QR_IMAGE_TYPE,
]
export const DYNAMIC_BLOCK_TYPES: string[] = [
    BLOCK_DYNAMIC_TEXT_TYPE,
    BLOCK_QR_IMAGE_TYPE,
]
export const STATIC_BLOCK_SCANNER_QR_TYPE = 'scanner-qr'
export const STATIC_BLOCK_INPUT_CARD_TYPE = 'input-card'
export const STATIC_BLOCK_TYPES: string[] = [
    STATIC_BLOCK_SCANNER_QR_TYPE,
    STATIC_BLOCK_INPUT_CARD_TYPE,
]

export const BLOCK_STYLE_COLOR = STYLE_COLOR
// export const BLOCK_STYLE_FONT_FAMILY = STYLE_FONT_FAMILY
export const BLOCK_STYLE_FONT_SIZE = STYLE_FONT_SIZE
export const BLOCK_STYLE_FONT_WEIGHT = STYLE_FONT_WEIGHT
export const BLOCK_STYLE_FONT_STYLE = STYLE_FONT_STYLE
export const BLOCK_STYLE_WIDTH = STYLE_WIDTH
export const BLOCK_STYLE_HEIGHT = STYLE_HEIGHT
export const BLOCK_STYLE_LIST: string[] = [
    BLOCK_STYLE_COLOR,
    // BLOCK_STYLE_FONT_FAMILY,
    BLOCK_STYLE_FONT_SIZE,
    BLOCK_STYLE_FONT_WEIGHT,
    BLOCK_STYLE_FONT_STYLE,
    BLOCK_STYLE_WIDTH,
    BLOCK_STYLE_HEIGHT,
]

export const BLOCK_STYLE_FONT_WEIGHT_OPTIONS = [
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
]

export const BLOCK_SETTING_WIDTH = STYLE_WIDTH
export const BLOCK_SETTING_HEIGHT = STYLE_HEIGHT
export const BLOCK_SETTING_DEFAULT_DYNAMIC_VALUE = 'default-dynamic-value'
export const BLOCK_SETTING_TITLE = 'title'
export const BLOCK_SETTING_INPUT_PLACEHOLDER = 'input-placeholder'
export const BLOCK_SETTING_BUTTON_TEXT = 'button-text'
export const BLOCK_SETTING_LIST: string[] = [
    BLOCK_SETTING_TITLE,
    BLOCK_SETTING_INPUT_PLACEHOLDER,
    BLOCK_SETTING_BUTTON_TEXT,
]

export const BLOCK_TEXT_DEFAULT_STYLE: BlockSetting[] = [
        { key: BLOCK_STYLE_COLOR, label: 'Text Color', type: 'color', value: '#000000' },
        // { key: BLOCK_STYLE_FONT_FAMILY, label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Times New Roman'] },
        { key: BLOCK_STYLE_FONT_SIZE, label: 'Font Size', type: 'text', value: '1rem' },
        { key: BLOCK_STYLE_FONT_WEIGHT, label: 'Bold', type: 'select', value: '500', options: cloneObject(BLOCK_STYLE_FONT_WEIGHT_OPTIONS) },
        { key: BLOCK_STYLE_FONT_STYLE, label: 'Italic', type: 'checkbox', value: 'normal', trueValue: 'italic', falseValue: 'normal' },
]

export const BLOCK_IMAGE_DEFAULT_STYLE: BlockSetting[] = [
        { key: BLOCK_STYLE_WIDTH, label: 'Width', type: 'text', value: '100px' },
        { key: BLOCK_STYLE_HEIGHT, label: 'Height', type: 'text', value: '100px' },
]

export const BLOCK_TEXT_DEFAULT: ElementBlock = {
    id: `{{ ${BLOCK_TEXT_TYPE} }}`,
    type: BLOCK_TEXT_TYPE,
    label: 'Text',
    value: 'Hello World',
    setting: [],
    style: cloneObject(BLOCK_TEXT_DEFAULT_STYLE),
    x: 0,
    y: 0,
    withValue: true,
}

export const BLOCK_IMAGE_DEFAULT: ElementBlock = {
    id: `{{ ${BLOCK_IMAGE_TYPE} }}`,
    type: BLOCK_IMAGE_TYPE,
    label: 'Image',
    value: 'https://placehold.co/100',
    setting: [],
    style: cloneObject(BLOCK_IMAGE_DEFAULT_STYLE),
    x: 0,
    y: 0,
    withValue: true,
}

export const CUSTOM_BLOCKS: ElementBlock[] = [
    BLOCK_TEXT_DEFAULT,
    BLOCK_IMAGE_DEFAULT,
]

export const STATIC_BLOCK_SCANNER_QR: ElementBlock = {
    id: `{{ ${STATIC_BLOCK_SCANNER_QR_TYPE} }}`,
    type: STATIC_BLOCK_SCANNER_QR_TYPE,
    label: 'QR Code',
    value: 'https://placehold.co/100?text=QR+Code',
    setting: [],
    style: [],
    x: 50,
    y: 50,
}

export const STATIC_BLOCK_INPUT_CARD: ElementBlock = {
    id: `{{ ${STATIC_BLOCK_INPUT_CARD_TYPE} }}`,
    type: STATIC_BLOCK_INPUT_CARD_TYPE,
    label: 'Input Card',
    value: '',
    setting: [
        { key: BLOCK_SETTING_TITLE, label: 'Title', value: 'Title' },
        { key: BLOCK_SETTING_INPUT_PLACEHOLDER, label: 'Input Placeholder', value: 'Placeholder' },
        { key: BLOCK_SETTING_BUTTON_TEXT, label: 'Button Text', value: 'Submit' },
    ],
    style: [],
    x: 50,
    y: 50,
}

export const STATIC_BLOCKS: ElementBlock[] = [
    STATIC_BLOCK_SCANNER_QR,
    STATIC_BLOCK_INPUT_CARD,
]
