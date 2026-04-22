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
export const BLOCK_STYLE_FONT_FAMILY = STYLE_FONT_FAMILY
export const BLOCK_STYLE_FONT_SIZE = STYLE_FONT_SIZE
export const BLOCK_STYLE_FONT_WEIGHT = STYLE_FONT_WEIGHT
export const BLOCK_STYLE_FONT_STYLE = STYLE_FONT_STYLE
export const BLOCK_STYLE_WIDTH = STYLE_WIDTH
export const BLOCK_STYLE_HEIGHT = STYLE_HEIGHT
export const BLOCK_STYLE_LIST: string[] = [
    BLOCK_STYLE_COLOR,
    BLOCK_STYLE_FONT_FAMILY,
    BLOCK_STYLE_FONT_SIZE,
    BLOCK_STYLE_FONT_WEIGHT,
    BLOCK_STYLE_FONT_STYLE,
    BLOCK_STYLE_WIDTH,
    BLOCK_STYLE_HEIGHT,
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
        { key: BLOCK_STYLE_FONT_FAMILY, label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Times New Roman'] },
        { key: BLOCK_STYLE_FONT_SIZE, label: 'Font Size', type: 'number', value: '1' },
        { key: BLOCK_STYLE_FONT_WEIGHT, label: 'Bold', type: 'checkbox', value: false },
        { key: BLOCK_STYLE_FONT_STYLE, label: 'Italic', type: 'checkbox', value: false },
    ],
    x: 0,
    y: 0,
    compiledStyle: 'color: #000000; font-family: Arial, sans-serif; font-size: 1rem; font-weight: normal; font-style: normal;',
    html: (settings: BlockSetting[], compiledStyle: string, value: string) => {
        return `
            <p style="${compiledStyle}">
                ${value || ''}
            </p>`
    },
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
        { key: BLOCK_STYLE_WIDTH, label: 'Width', type: 'number', value: '100' },
        { key: BLOCK_STYLE_HEIGHT, label: 'Height', type: 'number', value: '100' },
    ],
    x: 0,
    y: 0,
    compiledStyle: 'width: 100px; height: 100px;',
    html: (settings: BlockSetting[], compiledStyle: string, value: string) => {
        return `
            <img
                src="${value || ''}"
                style="${compiledStyle}"
            />
        `
    },
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
    compiledStyle: '',
    html: (settings: BlockSetting[], compiledStyle: string, value: string) => {
        return `
            <img
                src="${value || ''}"
                style="${compiledStyle}"
            />
        `
    },
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
    compiledStyle: '',
    html: (settings: BlockSetting[], compiledStyle: string, _value: string) => {
        const _ = compiledStyle
        const title = settings.find(d => d.key === BLOCK_SETTING_TITLE)?.value || 'Title'
        const placeholder = settings.find(d => d.key === BLOCK_SETTING_INPUT_PLACEHOLDER)?.value || 'Placeholder'
        const buttonText = settings.find(d => d.key === BLOCK_SETTING_BUTTON_TEXT)?.value || 'Submit'
        return `
            <div style="width:200px; padding:16px; border:1px solid #ccc; border-radius:8px; background:#fff; text-align: center">
                <h3 style="font-size:2rem; margin:0 0 12px 0;">
                    ${title}
                </h3>
                <input type="text" placeholder="${placeholder}" style="width:90%; padding:8px; font-size:1rem; border:1px solid #ccc; border-radius:4px; margin-bottom:12px;" />
                <button style="width:100%; padding:8px; background:#007bff; color:#fff; border:none; border-radius:4px;">
                    ${buttonText}
                </button>
            </div>
        `
    },
    editableData: true,
}

export const STATIC_BLOCKS: ElementBlock[] = [
    STATIC_BLOCK_SCANNER_QR,
    STATIC_BLOCK_INPUT_CARD,
]
