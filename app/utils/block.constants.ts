export const EDITOR_MODE_INVITATION_EMAIL = 'invitation-email'
export const EDITOR_MODE_CHECK_IN_PAGE = 'check-in-page'
export const EDITOR_CANVAS_WIDTH = 600
export const EDITOR_CANVAS_HEIGHT = 1750
export const EDITOR_CANVAS_SCALE = 0.80
export const EDITOR_CANVAS_PORTRAIT = 'portrait'
export const EDITOR_CANVAS_LANDSCAPE = 'landscape'

export const CANVAS_SIZE_PRESETS_INVITATION_EMAIL: CanvasSize[] = [
    { id: '1', width: 432, height: 768, label: 'Medium', breakpoint: 'md', orientation: EDITOR_CANVAS_PORTRAIT },
]

export const CANVAS_SIZE_PRESETS_CHECK_IN_PAGE: CanvasSize[] = [
    { id: '1', width: 360, height: 640, label: 'Mobile', breakpoint: 'sm', orientation: EDITOR_CANVAS_PORTRAIT },
    { id: '2', width: 432, height: 768, label: 'Tablet', breakpoint: 'md', orientation: EDITOR_CANVAS_PORTRAIT },
    { id: '3', width: 1024, height: 768, label: 'Laptop', breakpoint: 'lg', orientation: EDITOR_CANVAS_LANDSCAPE },
    { id: '4', width: 1280, height: 720, label: 'Desktop', breakpoint: 'xl', orientation: EDITOR_CANVAS_LANDSCAPE },
]

export const BLOCK_TEXT_ID = 'text'
export const BLOCK_IMAGE_ID = 'image'
export const BLOCK_IDS: string[] = [
    BLOCK_TEXT_ID,
    BLOCK_IMAGE_ID,
]
export const STATIC_BLOCK_SCANNER_QR_ID = 'scanner-qr'
export const STATIC_BLOCK_INPUT_CARD_ID = 'input-card'
export const STATIC_BLOCK_IDS: string[] = [
    STATIC_BLOCK_SCANNER_QR_ID,
    STATIC_BLOCK_INPUT_CARD_ID,
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

export const BLOCK_SETTING_TITLE = 'title'
export const BLOCK_SETTING_INPUT_PLACEHOLDER = 'input-placeholder'
export const BLOCK_SETTING_BUTTON_TEXT = 'button-text'
export const BLOCK_SETTING_LIST: string[] = [
    BLOCK_SETTING_TITLE,
    BLOCK_SETTING_INPUT_PLACEHOLDER,
    BLOCK_SETTING_BUTTON_TEXT,
]

export const BLOCK_TEXT_DEFAULT: ElementBlock = {
    uid: '',
    id: BLOCK_TEXT_ID,
    label: 'Text',
    value: 'Hello World',
    setting: [],
    style: [
        { key: BLOCK_STYLE_COLOR, label: 'Text Color', type: 'color', value: '#000000' },
        // { key: BLOCK_STYLE_FONT_FAMILY, label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Times New Roman'] },
        { key: BLOCK_STYLE_FONT_SIZE, label: 'Font Size', type: 'text', value: '1rem' },
        { key: BLOCK_STYLE_FONT_WEIGHT, label: 'Bold', type: 'select', value: '500', options: structuredClone(toRaw(BLOCK_STYLE_FONT_WEIGHT_OPTIONS)) },
        { key: BLOCK_STYLE_FONT_STYLE, label: 'Italic', type: 'checkbox', value: 'normal', trueValue: 'italic', falseValue: 'normal' },
    ],
    x: 0,
    y: 0,
    previewStyle: 'color: #000000; font-size: 1rem; font-weight: 500; font-style: normal;',
    withValue: true,
    editableData: true,
}

export const BLOCK_IMAGE_DEFAULT: ElementBlock = {
    uid: '',
    id: BLOCK_IMAGE_ID,
    label: 'Image',
    value: 'https://placehold.co/100',
    setting: [],
    style: [
        { key: BLOCK_STYLE_WIDTH, label: 'Width', type: 'text', value: '100px' },
        { key: BLOCK_STYLE_HEIGHT, label: 'Height', type: 'text', value: '100px' },
    ],
    x: 0,
    y: 0,
    previewStyle: 'width: 100px; height: 100px;',
    withValue: true,
    editableData: true,
}

export const CUSTOM_BLOCKS: ElementBlock[] = [
    BLOCK_TEXT_DEFAULT,
    BLOCK_IMAGE_DEFAULT,
]

export const STATIC_BLOCK_SCANNER_QR: ElementBlock = {
    uid: '',
    id: STATIC_BLOCK_SCANNER_QR_ID,
    label: 'QR Code',
    value: 'https://placehold.co/100?text=QR+Code',
    setting: [],
    style: [],
    x: 50,
    y: 50,
    previewStyle: '',
    editableData: false,
}

export const STATIC_BLOCK_INPUT_CARD: ElementBlock = {
    uid: '',
    id: STATIC_BLOCK_INPUT_CARD_ID,
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
    previewStyle: '',
    editableData: true,
}

export const STATIC_BLOCKS: ElementBlock[] = [
    STATIC_BLOCK_SCANNER_QR,
    STATIC_BLOCK_INPUT_CARD,
]
