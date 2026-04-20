export function getBlockStyleValue(style: BlockStyle[], key: string): string | boolean | number | undefined {
    return style.find(s => s.key === key)?.value
}

export function compileBlockStyle(block: Block) {
    if (block.id === BLOCK_TEXT_ID) {
        return `
            ${BLOCK_STYLE_COLOR}:${getBlockStyleValue(block.style, BLOCK_STYLE_COLOR)};
            ${BLOCK_STYLE_FONT_FAMILY}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_FAMILY)};
            ${BLOCK_STYLE_FONT_SIZE}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_SIZE)}rem;
            ${BLOCK_STYLE_FONT_WEIGHT}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_WEIGHT) ? 'bold' : 'normal'};
            ${BLOCK_STYLE_FONT_STYLE}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_STYLE) ? 'italic' : 'normal'};
        `
    }

    if (block.id === BLOCK_IMAGE_ID) {
        return `
            ${BLOCK_STYLE_WIDTH}:${getBlockStyleValue(block.style, BLOCK_STYLE_WIDTH)}px;
            ${BLOCK_STYLE_HEIGHT}:${getBlockStyleValue(block.style, BLOCK_STYLE_HEIGHT)}px;
        `
    }

    // if (block.id === STATIC_BLOCK_SCANNER_QR_ID) {
    //     const size = String(getBlockStyleValue(block.style, 'size'))
    //     return `width:${size}rem; height:${size}rem;`
    // }

    // if (block.id === STATIC_BLOCK_INPUT_CARD_ID) {
    //     const buttonColor = String(getBlockStyleValue(block.style, 'buttonColor'))
    //     const titleFontSize = String(getBlockStyleValue(block.style, 'titleFontSize'))
    //     const inputFontSize = String(getBlockStyleValue(block.style, 'inputFontSize'))
    //     return `button-color:${buttonColor}; title-font-size:${titleFontSize}rem; input-font-size:${inputFontSize}rem;`
    // }

    return ''
}

export function getAbsoluteDivStyle(block: Block) {
    if (!import.meta.client) return ''
    if (!block) return ''

    return `
        position: absolute;
        left: ${block.x}%;
        top: ${block.y}%;
        transform: translate(-50%, -50%);
    `
}

export function invitationEmailHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page {
                size: ${width}px ${height}px;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
            }
            .page {
                width: ${width}px;
                height: ${height}px;
                position: relative;
            }
            .background {
                background-image: url(${bgImage.dataUrl});
                background-size: cover;
                background-position: center;
            }
            .viewport {
                width: 100vw;
                display: flex;
                justify-content: center;
            }
            .scaler {
                transform-origin: top center;
                transform: scale(calc(100vw / ${width}));
            }
        </style>
    </head>
    <body>
        <div class="viewport">
            <div class="scaler">
                <div class="page background">
                    ${content}
                    ${staticContent}
                </div>
            </div>
        </div>
    </body>
    </html>
    `
}

export function checkInPageHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                .container {
                    position: relative;
                    height: ${height}px;
                    width: ${width}px;
                    overflow: hidden;
                }
                .bg-blur {
                    position: absolute;
                    inset: 0;
                    background-image: var(--bg);
                    background-size: cover;
                    background-position: center;
                    filter: blur(40px) brightness(0.75);
                    transform: scale(1.1);
                }
                .bg-main {
                    position: absolute;
                    inset: 0;
                    background-image: var(--bg);
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .content {
                    z-index: 1;
                }
            </style>
        </head>
        <body style="margin:0;padding:0;">
            <div class="container">
                <div
                    class="bg-blur"
                    style="--bg: url(${bgImage.dataUrl});"
                ></div>

                <div
                    class="bg-main"
                    style="--bg: url(${bgImage.dataUrl});"
                ></div>

                <div class="content">
                    ${content}
                    ${staticContent}
                </div>
            </div>
        </body>
    </html>
    `
}
