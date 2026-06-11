/* eslint-disable @typescript-eslint/no-explicit-any */
export function isStylingSuffix(value: string): value is StylingSuffix {
    return STYLING_SUFFIXES.includes(value as StylingSuffix)
}

export function isBreakpoint(value: string): value is Breakpoint {
    return BREAKPOINTS.includes(value as Breakpoint)
}

export function getBlockStyleValue(style: BlockSetting[], key: string): string | boolean | number | undefined {
    return style.find(s => s.key === key)?.value
}

export function getBlockValue(block: Block): string | boolean | number {
  if (DYNAMIC_BLOCK_IDS.includes(block.type)) {
    return block.setting.find(e => e.key === BLOCK_SETTING_DEFAULT_DYNAMIC_VALUE)?.value || block.value || ''
  } else {
    return block.value || ''
  }
}

export function compilePreviewStyle(block: Block) {
    if (block.type === BLOCK_TEXT_ID || block.type === BLOCK_DYNAMIC_TEXT_ID) {
        return `
            ${BLOCK_STYLE_COLOR}:${getBlockStyleValue(block.style, BLOCK_STYLE_COLOR)};
            ${BLOCK_STYLE_FONT_SIZE}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_SIZE)};
            ${BLOCK_STYLE_FONT_WEIGHT}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_WEIGHT)};
            ${BLOCK_STYLE_FONT_STYLE}:${getBlockStyleValue(block.style, BLOCK_STYLE_FONT_STYLE)};
        `
    }

    if (block.type === BLOCK_IMAGE_ID || block.type === BLOCK_QR_IMAGE_ID) {
        return `
            ${BLOCK_STYLE_WIDTH}:${getBlockStyleValue(block.style, BLOCK_STYLE_WIDTH)};
            ${BLOCK_STYLE_HEIGHT}:${getBlockStyleValue(block.style, BLOCK_STYLE_HEIGHT)};
        `
    }

    return ''
}

export function renderHtmlBlock(block: ElementBlock) {
    const styleClass = getResponsiveStyle(block)
    const cssClass: string = styleClass.tailwindClass.join(' ')
    const cssStyle: string = Object.entries(styleClass.style)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ')

    if (block.type === BLOCK_TEXT_ID) {
        return `
          <p class="${cssClass}" style="${cssStyle}">
              ${block.value || ''}
          </p>
      `
    }
    else if (block.type === BLOCK_IMAGE_ID) {
        const settingWidth = block.setting.find(e => e.key === BLOCK_SETTING_WIDTH)
        const settingHeight = block.setting.find(e => e.key === BLOCK_SETTING_HEIGHT)

        return `
          <img
              src="${block.value || ''}"
              class="${cssClass}"
              style="${cssStyle}"
              ${settingWidth ? `width=${settingWidth.value}` : ''}
              ${settingHeight ? `width=${settingHeight.value}` : ''}
          />
      `
    }
    else if (block.type === BLOCK_DYNAMIC_TEXT_ID) {
        const defaultValue = block.setting.find(e => e.key === BLOCK_SETTING_DEFAULT_DYNAMIC_VALUE)

        return `
          <p class="${cssClass}" style="${cssStyle}">
              ${defaultValue?.value || block.value || ''}
          </p>
      `
    }
    else if ( block.type === BLOCK_QR_IMAGE_ID) {
        const settingWidth = block.setting.find(e => e.key === BLOCK_SETTING_WIDTH)
        const settingHeight = block.setting.find(e => e.key === BLOCK_SETTING_HEIGHT)
        const defaultValue = block.setting.find(e => e.key === BLOCK_SETTING_DEFAULT_DYNAMIC_VALUE)

        return `
          <img
              src="${defaultValue?.value || block.value || ''}"
              class="${cssClass}"
              style="${cssStyle}"
              ${settingWidth ? `width=${settingWidth.value}` : ''}
              ${settingHeight ? `width=${settingHeight.value}` : ''}
          />
      `
    }
    else {
        return ''
    }
}

export function renderPreviewHtml(block: Block, value: string | boolean | number, previewStyle: string) {
    if (
      block.type === BLOCK_TEXT_ID
      || block.type === BLOCK_DYNAMIC_TEXT_ID
    ) {
        return `
            <p style="${previewStyle}">
                ${value || ''}
            </p>
        `
    }
    else if (
        block.type === BLOCK_IMAGE_ID
        || block.type === BLOCK_QR_IMAGE_ID
        || (block.type === STATIC_BLOCK_SCANNER_QR_ID)
    ) {
        const settingWidth = block.setting.find(e => e.key === BLOCK_SETTING_WIDTH)
        const settingHeight = block.setting.find(e => e.key === BLOCK_SETTING_HEIGHT)

        return `
            <img
                src="${value || ''}"
                style="${previewStyle}"
                ${settingWidth ? `width=${settingWidth.value}` : ''}
                ${settingHeight ? `width=${settingHeight.value}` : ''}
            />
        `
    }
    else if (block.type === STATIC_BLOCK_INPUT_CARD_ID) {
        const settingTitle = block.setting.find(d => d.key === BLOCK_SETTING_TITLE)
        const settingPlaceholder = block.setting.find(d => d.key === BLOCK_SETTING_INPUT_PLACEHOLDER)
        const settingButtonText = block.setting.find(d => d.key === BLOCK_SETTING_BUTTON_TEXT)

        return `
            <div style="width:200px; padding:16px; border:1px solid #ccc; border-radius:8px; background:#fff; text-align: center">
                <h3 style="font-size:2rem; margin:0 0 12px 0;">
                    ${settingTitle?.value || 'Title'}
                </h3>
                <input
                    type="text"
                    placeholder="${settingPlaceholder?.value || 'Placeholder'}"
                    style="width:90%; padding:8px; font-size:1rem; border:1px solid #ccc; border-radius:4px; margin-bottom:12px;"
                />
                <button style="width:100%; padding:8px; background:#007bff; color:#fff; border:none; border-radius:4px;">
                    ${settingButtonText?.value || 'Submit'}
                </button>
            </div>
        `
    }
    else {
        return ''
    }
}

export function makeDynamicElementBlock(elements: TemplateElementDynamicVar[]): ElementBlock[] {
  const blocks: ElementBlock[] =[]

  for (let idx = 0; idx < elements.length; idx++) {
    const el = elements[idx]!
    if (!DYNAMIC_BLOCK_IDS.includes(el.type)) continue

    const style: BlockSetting[] = []
    const setting: BlockSetting[] = [
        {
          key: BLOCK_SETTING_DEFAULT_DYNAMIC_VALUE,
          label: 'Default Preview Value',
          type: 'text',
          value: el.default_value,
          hidden: true,
        },
    ]

    if (el.type === BLOCK_DYNAMIC_TEXT_ID) {
      style.push(...cloneObject(BLOCK_TEXT_DEFAULT_STYLE))
    }
    else if (el.type === BLOCK_QR_IMAGE_ID) {
      style.push(...cloneObject(BLOCK_IMAGE_DEFAULT_STYLE))
      setting.push(
        { key: BLOCK_SETTING_WIDTH, label: 'Width', type: 'text', value: '100px' },
        { key: BLOCK_SETTING_HEIGHT, label: 'Height', type: 'text', value: '100px' },
      )
    }

    blocks.push({
      id: el.value, // because somehow BE can't provide different type for each dynamic element
      type: el.type,
      label: el.name,
      value: el.value,
      setting,
      style,
      x: 0,
      y: 0,
      withValue: false,
      editableData: true,
    })
  }
  
  return blocks
}

export function getPositionStyle(block: Block) {
    if (!import.meta.client) return ''
    if (!block) return ''

    return `
        position: absolute;
        left: ${block.x}%;
        top: ${block.y}%;
        transform: translate(-50%, -50%);
    `
}

export function getResponsivePositionStyle(elBlock: ElementBlock | undefined): ResponsiveElementSetting {
    const empty: ResponsiveElementSetting = {
        tailwindClass: [],
        style: {
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
        },
    }
    if (!elBlock || !elBlock.perBreakpoint) {
        empty.style.top = '50%'
        empty.style.left = '50%'
        return empty
    }

    const validBp = Object.keys(elBlock.perBreakpoint).filter(isBreakpoint)
    const smallestBp = findSmallestBreakpoint(validBp)

    return validBp.reduce<ResponsiveElementSetting>((acc, bp) => {
        if (!elBlock.perBreakpoint || !isBreakpoint(bp)) return acc

        const block = elBlock.perBreakpoint[bp]!
        const {
            cssVariable: xCssVariable,
            tailwindClass: xTailwindClass,
            getValue: xGetValue,
        } = responsiveStyleClass(bp, STYLING_POS_X_SUFFIX, bp === smallestBp, validBp.length === 1)
        acc.style[xCssVariable] = xGetValue(block.x)
        acc.tailwindClass.push(xTailwindClass)

        const {
            cssVariable: yCssVariable,
            tailwindClass: yTailwindClass,
            getValue: yGetValue,
        } = responsiveStyleClass(bp, STYLING_POS_Y_SUFFIX, bp === smallestBp, validBp.length === 1)
        acc.style[yCssVariable] = yGetValue(block.y)
        acc.tailwindClass.push(yTailwindClass)

        return acc
    }, empty)
}

export function getResponsiveStyle(elBlock: ElementBlock | undefined): ResponsiveElementSetting {
    const empty: ResponsiveElementSetting = {
        tailwindClass: [],
        style: {},
    }
    if (!elBlock || !elBlock.perBreakpoint) return empty

    const validBp = Object.keys(elBlock.perBreakpoint).filter(isBreakpoint)
    const smallestBp = findSmallestBreakpoint(validBp)

    return validBp.reduce<ResponsiveElementSetting>((acc, bp) => {
        if (!elBlock.perBreakpoint || !isBreakpoint(bp)) return acc

        const block = elBlock.perBreakpoint[bp]!
        const res = block.style.reduce<ResponsiveElementSetting>((accumulator, current) => {
            if (!BLOCK_STYLE_LIST.includes(current.key)) return accumulator

            const suffix = `-${current.key}`
            if (!isStylingSuffix(suffix)) return accumulator

            const {
                cssVariable,
                tailwindClass,
                getValue,
            } = responsiveStyleClass(bp, suffix, bp === smallestBp, validBp.length === 1)
            accumulator.style[cssVariable] = getValue(current.value)
            accumulator.tailwindClass.push(tailwindClass)

            return accumulator
        }, cloneObject(empty))

        acc.style = { ...acc.style, ...res.style }
        acc.tailwindClass = [...acc.tailwindClass, ...res.tailwindClass]
        return acc
    }, cloneObject(empty))
}

export function getInvitationEmailHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
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
    <body style="font-family: Arial;">
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

export function getCheckInPageHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
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
        <body style="font-family: Arial;margin:0;padding:0;">
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

function filterBlockData(
    type: 'style' | 'setting',
    data: Record<string, any>,
    blockDef: ElementBlock,
): BlockSetting[] {
    const allowedList = type === 'style' ? BLOCK_STYLE_LIST : BLOCK_SETTING_LIST
    const defList = type === 'style' ? blockDef.style : blockDef.setting

    return Object.entries(data).reduce<BlockSetting[]>((acc, [key, value]) => {
        if (!allowedList.includes(key)) return acc

        const def = defList.find(s => s.key === key)
        if (!def) return acc

        acc.push({
            key,
            value,
            label: def.label,
            type: def.type,
            options: def.options,
        })

        return acc
    }, [])
}

export function makeTemplateVariant(
  blocks: ElementBlock[],
  slug: string,
  bgImage: string,
  bgImageUploadKey: string,
  variantId?: number
): TemplateVariant {
    const elements: TemplateElement[] = []
    for (const block of blocks) {
        // do not accept undefined uid
        // as it's for grouping the element
        if (block.uid === undefined) continue
        const el: TemplateElement = {
            element_id: block.elementId,
            value: block.value,
            type: block.type,
            group: block.uid,
            position_x: block.x,
            position_y: block.y,
            style: Object.fromEntries(block.style.map(s => [s.key, s.value])),
            setting: Object.fromEntries(block.setting.map(s => [s.key, s.value])),
        }

        elements.push(el)
    }

    const variant: TemplateVariant = {
        variant_id: variantId,
        slug: slug,
        setting: {},
        elements,
    }
    if (bgImage !== '') variant.background_image_url = bgImage
    if (bgImageUploadKey !== '') variant.background_url_upload_key = bgImageUploadKey

    return variant
}

export function mapTemplateVariantToBlocks(variants: TemplateVariant[], validBreakpoints: Breakpoint[], dynamicBlocks?: ElementBlock[]): {
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
    breakpoints: Partial<Record<Breakpoint, number | undefined>>
    backgroundImages: Partial<Record<Breakpoint, BackgroundImage>>
} {
    const blockMap: Record<number, ElementBlock> = {}

    const defaultMap: Record<string, ElementBlock> = {}
    for (const b of STATIC_BLOCKS) defaultMap[b.id] = b
    for (const b of CUSTOM_BLOCKS) defaultMap[b.id] = b
    if (dynamicBlocks) for (const b of dynamicBlocks) defaultMap[b.id] = b

    const breakpoints: Partial<Record<Breakpoint, number | undefined>> = {}
    const backgroundImages: Partial<Record<Breakpoint, BackgroundImage>> = {}

    for (const variant of variants) {
        const bp = variant.slug as Breakpoint
        breakpoints[bp] = variant.variant_id
        backgroundImages[bp] = {
            dataUrl: variant.background_image_url || '',
            name: (variant.background_image_url || '').split('/').filter(Boolean).pop() || '',
            uploadKey: '',
            width: variant.setting.width ? Number(variant.setting.width.replace(/px$/, '')) || 0 : 0,
            height: variant.setting.height ? Number(variant.setting.height.replace(/px$/, '')) || 0 : 0,
        }

        if (variant.elements === null) variant.elements = []
        for (const el of variant.elements) {
            // do not accept undefined uid
            // as it's for grouping the element
            if (el.group === undefined) continue
            let block = blockMap[el.group]

            if (!block) {
                // because somehow BE can't provide different type for each dynamic element
                // use value as id if it's dynamic element
                const isDynamicBlock = DYNAMIC_BLOCK_IDS.includes(el.type)
                const base = defaultMap[isDynamicBlock ? el.value : el.type]

                if (!base) continue
                const disableValue = !isDynamicBlock
                block = {
                    ...base,
                    uid: el.group,
                    value: el.value,
                    withValue: disableValue,
                    perBreakpoint: {},
                }
                if (block.setting.length <= 0) block.editableData = false

                blockMap[el.group] = block
            }

            block.perBreakpoint![bp] = {
                elementId: el.element_id,
                uid: el.group,
                id: DYNAMIC_BLOCK_IDS.includes(el.type) ? el.value : el.type,
                type: el.type,
                x: el.position_x,
                y: el.position_y,
                value: el.value,
                withValue: block.withValue,
                style: el.style && Object.entries(el.style).length > 0 ? filterBlockData('style', el.style, block) : cloneObject(block.style),
                setting: el.setting && Object.entries(el.setting).length > 0 ? filterBlockData('setting', el.setting, block) : cloneObject(block.setting),
            }
        }
    }

    const allBlocks = Object.values(blockMap)

    const staticBlocks: ElementBlock[] = []
    const customBlocks: ElementBlock[] = []

    for (const block of allBlocks) {
        const blockBreakpoint = Object.keys(block.perBreakpoint || {}) as Breakpoint[]
        // only accept block that has breakpoints
        if (blockBreakpoint.length <= 0) {
            continue
        }

        for (const validBp of validBreakpoints) {
            // set block breakpoint data for unsaved breakpoint
            // so it can render when valid breakpoints added
            if (block.perBreakpoint![validBp] === undefined) {
                block.perBreakpoint![validBp] = cloneObject(block.perBreakpoint![blockBreakpoint[0]!])
                block.perBreakpoint![validBp]!.elementId = undefined
            }
        }

        if (STATIC_BLOCK_IDS.includes(block.type)) {
            staticBlocks.push(block)
        }
        else {
            customBlocks.push(block)
        }
    }

    return {
        customBlocks,
        staticBlocks,
        breakpoints,
        backgroundImages,
    }
}
