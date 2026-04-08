export const EDITOR_MODE_INVITATION_EMAIL = 'invitation-email'
export const EDITOR_MODE_CHECK_IN_PAGE = 'check-in-page'
export const EDITOR_CANVAS_WIDTH = 600
export const EDITOR_CANVAS_HEIGHT = 1750
export const EDITOR_CANVAS_SCALE = 0.55
export const EDITOR_CANVAS_PORTRAIT = 'portrait'
export const EDITOR_CANVAS_LANDSCAPE = 'landscape'

export const PREVIEW_EDITOR_INVITATION_EMAIL = 'preview-invitation-email'
export const PREVIEW_EDITOR_CHECK_IN_PAGE = 'preview-check-in-page'

export const CANVAS_SIZE_PRESETS_DEFAULT: CanvasSize[] = [
    { width: 360, height: 640, label: '360x640 (Android)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 390, height: 844, label: '390x844 (iPhone)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 1024, height: 768, label: '1024x768 (Tablet)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1366, height: 768, label: '1366x768 (Laptop)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1920, height: 1080, label: '1920x1080 (HD)', orientation: EDITOR_CANVAS_LANDSCAPE },
]

export const CANVAS_SIZE_PRESETS_INVITATION_EMAIL: CanvasSize[] = [
    { width: 600, height: 1750, label: '600x1750 (Email)', orientation: EDITOR_CANVAS_PORTRAIT },
]

export const CANVAS_SIZE_PRESETS_CHECK_IN_PAGE: CanvasSize[] = [
    { width: 360, height: 640, label: '360x640 (Android)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 390, height: 844, label: '390x844 (iPhone)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 1024, height: 768, label: '1024x768 (Tablet)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1366, height: 768, label: '1366x768 (Laptop)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1920, height: 1080, label: '1920x1080 (HD)', orientation: EDITOR_CANVAS_LANDSCAPE },
]

export const BLOCK_TEXT_ID = 'text'
export const BLOCK_IMAGE_ID = 'image'
export const STATIC_BLOCK_QR_CODE_ID = 'qr-code'
export const STATIC_BLOCK_INPUT_CARD_ID = 'input-card'
export const STATIC_BLOCK_IDS: string[] = [
    STATIC_BLOCK_QR_CODE_ID,
    STATIC_BLOCK_INPUT_CARD_ID,
]

export const BLOCK_TEXT_DEFAULT: Block = {
    uid: '',
    id: BLOCK_TEXT_ID,
    label: 'Text',
    data: [{ key: 'text', label: 'Text', value: 'Hello World' }],
    style: [
        { key: 'textColor', label: 'Text Color', type: 'color', value: '#000000' },
        { key: 'fontFamily', label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'] },
        { key: 'fontSans', label: 'Sans Serif Fallback', type: 'checkbox', value: true },
        { key: 'fontSize', label: 'Font Size', type: 'number', value: '1' },
        { key: 'fontBold', label: 'Bold', type: 'checkbox', value: false },
        { key: 'fontItalic', label: 'Italic', type: 'checkbox', value: false },
    ],
    portraitPos: {
        x: 0,
        y: 0,
    },
    landscapePos: {
        x: 0,
        y: 0,
    },
    compiledStyle: 'color: #000000; font-family: Arial, sans-serif; font-size: 1rem; font-weight: normal; font-style: normal;',
    html: (data: BlockData[], compiledStyle: string) => {
        return `<p style="${compiledStyle}">${data.find(d => d.key === 'text')?.value || ''}</p>`
    },
    editableData: true,
}

export const BLOCK_TEXT_DEFAULT_NEW: Block = {
    uid: '',
    id: BLOCK_TEXT_ID,
    label: 'Text',
    data: [{ key: 'text', label: 'Text', value: 'Hello World' }],
    style: [
        { key: 'textColor', label: 'Text Color', type: 'color', value: '#000000' },
        { key: 'fontFamily', label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'] },
        { key: 'fontSans', label: 'Sans Serif Fallback', type: 'checkbox', value: true },
        { key: 'fontSize', label: 'Font Size', type: 'number', value: '1' },
        { key: 'fontBold', label: 'Bold', type: 'checkbox', value: false },
        { key: 'fontItalic', label: 'Italic', type: 'checkbox', value: false },
    ],
    portraitPos: {
        x: 0,
        y: 0,
    },
    landscapePos: {
        x: 0,
        y: 0,
    },
    compiledStyle: 'color: #000000; font-family: Arial, sans-serif; font-size: 1rem; font-weight: normal; font-style: normal;',
    html: (data: BlockData[], compiledStyle: string) => {
        return `<p style="${compiledStyle}">${data.find(d => d.key === 'text')?.value || ''}</p>`
    },
    editableData: true,
}

export const BLOCK_IMAGE_DEFAULT: Block = {
    uid: '',
    id: BLOCK_IMAGE_ID,
    label: 'Image',
    data: [{ key: 'src', label: 'Image URL', value: 'https://placehold.co/100' }],
    style: [
        { key: 'width', label: 'Width', type: 'number', value: '100' },
        { key: 'height', label: 'Height', type: 'number', value: '100' },
        { key: 'heightSameAsWidth', label: 'Height same as width', type: 'checkbox', value: false },
    ],
    portraitPos: {
        x: 0,
        y: 0,
    },
    landscapePos: {
        x: 0,
        y: 0,
    },
    compiledStyle: 'width: 100px; height: 100px;',
    html: (data: BlockData[], compiledStyle: string) => {
        return `<img src="${data.find(d => d.key === 'src')?.value || ''}" style="${compiledStyle}" />`
    },
    editableData: true,
}

export const STATIC_BLOCK_QR_CODE: Block = {
    uid: '',
    id: STATIC_BLOCK_QR_CODE_ID,
    label: 'QR Code',
    data: [{ key: 'url', label: 'QR URL', value: 'dummy' }],
    style: [
        { key: 'size', label: 'Size (rem)', type: 'number', value: '4' },
    ],
    portraitPos: {
        x: 50,
        y: 50,
    },
    landscapePos: {
        x: 50,
        y: 50,
    },
    compiledStyle: '',
    html: (data: BlockData[], compiledStyle: string) => {
        const url = data.find(d => d.key === 'url')?.value || 'dummy'
        const size = compiledStyle.match(/width:(\d+)rem/)?.[1] || '6'
        return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(url)}" style="width:${size}rem; height:${size}rem;" />`
    },
    editableData: false,
}

export const STATIC_BLOCK_INPUT_CARD: Block = {
    uid: '',
    id: STATIC_BLOCK_INPUT_CARD_ID,
    label: 'Input Card',
    data: [{ key: 'title', label: 'Title', value: 'Title' }, { key: 'placeholder', label: 'Placeholder', value: 'Placeholder' }, { key: 'buttonText', label: 'Button Text', value: 'Submit' }],
    style: [
        { key: 'buttonColor', label: 'Button Color', type: 'color', value: '#007bff' },
        { key: 'titleFontSize', label: 'Title Font Size', type: 'number', value: '2' },
        { key: 'inputFontSize', label: 'Input Font Size', type: 'number', value: '1' },
    ],
    portraitPos: {
        x: 50,
        y: 50,
    },
    landscapePos: {
        x: 50,
        y: 50,
    },
    compiledStyle: '',
    html: (data: BlockData[], compiledStyle: string) => {
        const title = data.find(d => d.key === 'title')?.value || 'Title'
        const placeholder = data.find(d => d.key === 'placeholder')?.value || 'Placeholder'
        const buttonText = data.find(d => d.key === 'buttonText')?.value || 'Submit'
        const buttonColor = compiledStyle.match(/button-color:(#[0-9a-fA-F]{6})/)?.[1] || '#007bff'
        const titleFontSize = compiledStyle.match(/title-font-size:(\d+)rem/)?.[1] || '2'
        const inputFontSize = compiledStyle.match(/input-font-size:(\d+)rem/)?.[1] || '1'
        return `
            <div style="width:200px; padding:16px; border:1px solid #ccc; border-radius:8px; background:#fff; text-align: center">
                <h3 style="font-size:${titleFontSize}rem; margin:0 0 12px 0;">${title}</h3>
                <input type="text" placeholder="${placeholder}" style="width:90%; padding:8px; font-size:${inputFontSize}rem; border:1px solid #ccc; border-radius:4px; margin-bottom:12px;" />
                <button style="width:100%; padding:8px; background:${buttonColor}; color:#fff; border:none; border-radius:4px;">${buttonText}</button>
            </div>
        `
    },
    editableData: true,
}
