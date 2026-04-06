<script setup lang="ts">
function compileBlockStyle(type: string, style: BlockStyle[]) {
    const getStyleValue = (key: string) => style.find(s => s.key === key)?.value

    if (type === 'text') {
        const fontFamily = getStyleValue('fontSans')
            ? `${getStyleValue('fontFamily')}, sans-serif`
            : `${getStyleValue('fontFamily')}, serif`
        const fontSize = String(getStyleValue('fontSize'))
        const fontWeight = getStyleValue('fontBold') ? 'bold' : 'normal'
        const fontStyle = getStyleValue('fontItalic') ? 'italic' : 'normal'
        return `color:${getStyleValue('textColor')}; font-family:${fontFamily}; font-size:${fontSize}px; font-weight:${fontWeight}; font-style:${fontStyle};`
    }

    if (type === 'image') {
        const width = String(getStyleValue('width'))
        const same = getStyleValue('heightSameAsWidth')
        const height = same ? `${width}px` : `${getStyleValue('height')}px`
        return `width:${width}px; height:${height};`
    }

    return ''
}

const availableCards = ref<Block[]>([
    {
        uid: '',
        id: 'text',
        label: 'Text',
        data: 'Hello World',
        style: [
            { key: 'textColor', label: 'Text Color', type: 'color', value: '#000000' },
            { key: 'fontFamily', label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'] },
            { key: 'fontSans', label: 'Sans Serif Fallback', type: 'checkbox', value: true },
            { key: 'fontSize', label: 'Font Size', type: 'number', value: '16' },
            { key: 'fontBold', label: 'Bold', type: 'checkbox', value: false },
            { key: 'fontItalic', label: 'Italic', type: 'checkbox', value: false },
        ],
        compiledStyle: compileBlockStyle('text', [
            { key: 'textColor', label: 'Text Color', type: 'text', value: '#000000' },
            { key: 'fontFamily', label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'] },
            { key: 'fontSans', label: 'Sans Serif Fallback', type: 'checkbox', value: true },
            { key: 'fontSize', label: 'Font Size', type: 'number', value: '16' },
            { key: 'fontBold', label: 'Bold', type: 'checkbox', value: false },
            { key: 'fontItalic', label: 'Italic', type: 'checkbox', value: false },
        ]),
        html: (data, compiledStyle) => {
            return `<p style="${compiledStyle}">${data}</p>`
        },
        editableData: true,
        x: 0,
        y: 0,
    },
    {
        uid: '',
        id: 'image',
        label: 'Image',
        data: 'https://placehold.co/100',
        style: [
            { key: 'width', label: 'Width', type: 'number', value: '100' },
            { key: 'height', label: 'Height', type: 'number', value: '100' },
            { key: 'heightSameAsWidth', label: 'Height same as width', type: 'checkbox', value: false },
        ],
        compiledStyle: compileBlockStyle('image', [
            { key: 'width', label: 'Width', type: 'number', value: '100' },
            { key: 'height', label: 'Height', type: 'number', value: '100' },
            { key: 'heightSameAsWidth', label: 'Height same as width', type: 'checkbox', value: false },
        ]),
        html: (data, compiledStyle) => {
            return `<img src="${data}" style="${compiledStyle}" />`
        },
        editableData: false,
        x: 0,
        y: 0,
    },
])

const containerItems = ref<Block[]>([])

const bgImage = ref<string>('')

function getStyleValue(style: BlockStyle[], key: string): string | boolean | number | undefined {
    return style.find(s => s.key === key)?.value
}

function setStyleValue(style: BlockStyle[], key: string, value: string | boolean | number) {
    const item = style.find(s => s.key === key)
    if (item) {
        item.value = value
    }

    if (selectedItem.value && selectedBlock.value) {
        selectedItem.value.compiledStyle = compileBlockStyle(selectedBlock.value.id, style)
    }
}

function _addCard(card: Block) {
    const style = JSON.parse(JSON.stringify(card.style))
    containerItems.value.push({
        uid: crypto.randomUUID(),
        id: card.id,
        label: card.label,
        data: card.data,
        style,
        compiledStyle: compileBlockStyle(card.id, style),
        html: card.html,
        editableData: card.editableData,
        x: 50,
        y: 50,
    })
}

function onBgImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = () => {
            bgImage.value = reader.result as string
        }
        reader.readAsDataURL(file)
    }
}

function clearBgImage() {
    bgImage.value = ''
}

/* ---------------- DRAG FREE POSITION & DRAG ADD BLOCKS ---------------- */
const dragging = ref<string | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref({ x: 0, y: 0 })
const tempPosition = ref({ x: 0, y: 0 })

function startDrag(e: MouseEvent, item: Block) {
    dragging.value = item.uid
    selectedUid.value = item.uid

    offset.value = {
        x: e.clientX - item.x,
        y: e.clientY - item.y,
    }

    tempPosition.value = { x: item.x, y: item.y }
}

function onMouseMove(e: MouseEvent) {
    if (!dragging.value) return

    let newX = e.clientX - offset.value.x
    let newY = e.clientY - offset.value.y

    newX = Math.max(0, Math.min(newX, INVITATION_CANVAS_WIDTH - 128))
    newY = Math.max(0, Math.min(newY, INVITATION_CANVAS_HEIGHT - 80))

    tempPosition.value = { x: newX, y: newY }
}

function onBlockDragStart(e: DragEvent, blockId: string) {
    draggingBlock.value = blockId
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'copy'
    }
}

function onCanvasDragOver(e: DragEvent) {
    if (draggingBlock.value) {
        e.preventDefault()
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy'
        }
    }
}

function onCanvasDrop(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()

    const block = availableCards.value.find(b => b.id === draggingBlock.value)
    if (!block) return

    const canvasRect = (e.target as HTMLElement).getBoundingClientRect()
    const x = Math.round(Math.max(0, Math.min(e.clientX - canvasRect.left, INVITATION_CANVAS_WIDTH - 128)))
    const y = Math.round(Math.max(0, Math.min(e.clientY - canvasRect.top, INVITATION_CANVAS_HEIGHT - 80)))
    const uid = crypto.randomUUID()
    const style = JSON.parse(JSON.stringify(block.style))

    containerItems.value.push({
        uid,
        id: block.id,
        label: block.label,
        data: block.data,
        style,
        compiledStyle: compileBlockStyle(block.id, style),
        html: block.html,
        editableData: block.editableData,
        x,
        y,
    })

    selectedUid.value = uid
    draggingBlock.value = null
}

function stopDrag() {
    if (!dragging.value) return

    const item = containerItems.value.find(i => i.uid === dragging.value)
    if (item) {
        item.x = Math.round(tempPosition.value.x)
        item.y = Math.round(tempPosition.value.y)
    }

    dragging.value = null
}

onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDrag)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', stopDrag)
})

/* ---------------- SELECT ---------------- */
const selectedUid = ref<string | null>(null)

const selectedItem = computed(() =>
    containerItems.value.find(i => i.uid === selectedUid.value),
)

const selectedBlock = computed(() =>
    availableCards.value.find(b => b.id === selectedItem.value?.id),
)

const itemPosition = computed(() => (item: Block) => {
    if (dragging.value === item.uid) {
        return tempPosition.value
    }
    return { x: item.x, y: item.y }
})

/* ---------------- ACTIONS ---------------- */
function removeCard(uid: string) {
    containerItems.value = containerItems.value.filter(i => i.uid !== uid)
}

function duplicateCard(item: Block) {
    const style = JSON.parse(JSON.stringify(item.style))
    containerItems.value.push({
        ...item,
        uid: crypto.randomUUID(),
        x: item.x + 20,
        y: item.y + 20,
        style,
        compiledStyle: compileBlockStyle(item.id, style),
    })
}

function onBlockDragEnd() {
    draggingBlock.value = null
}

/* ---------------- HTML GENERATION ---------------- */
function renderBlock(item: Block) {
    const block = availableCards.value.find(b => b.id === item.id)
    if (!block) return ''
    return `<div style="position:absolute;left:${item.x}px;top:${item.y}px;">
    ${block.html(item.data, item.compiledStyle)}
  </div>`
}

const generatedHtml = computed(() => {
    const content = containerItems.value.map(renderBlock).join('\n')

    const bgStyle = bgImage.value ? `background-image: url(${bgImage.value}); background-size: cover; background-repeat: no-repeat;` : ''

    return `
<!DOCTYPE html>
<html>
<head>
<style>
.tmp-body-img {${bgStyle}}
</style>
</head>
<body class="tmp-body-img" style="position:relative;min-height:100%">
  ${content}
</body>
</html>
`
})

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <div class="grid grid-cols-7 h-[95vh] gap-4 p-8">
        <!-- LEFT: Block list + resizable HTML preview -->
        <div class="flex flex-col gap-4">
            <!-- BLOCKS -->
            <UCard :ui="{ body: 'p-2 sm:p-3' }">
                <template #header>
                    <h3>Blocks</h3>
                </template>
                <div class="space-y-2">
                    <div
                        v-for="card in availableCards"
                        :key="card.id"
                        class="py-2 px-4 border border-brand-950/25 dark:border-brand-50/25 hover:bg-brand-100 dark:hover:bg-brand-950 rounded cursor-move w-52"
                        draggable="true"
                        @dragstart="onBlockDragStart($event, card.id)"
                        @dragend="onBlockDragEnd"
                    >
                        {{ card.label }}
                    </div>
                </div>
            </UCard>

            <!-- RAW HTML (resizable) -->
            <UCard :ui="{ body: 'p-2 sm:p-3' }">
                <template #header>
                    <h3>HTML Preview</h3>
                </template>

                <UTextarea
                    v-model="generatedHtml"
                    size="sm"
                    class="rounded w-full font-mono py-1 px-2 resize-y"
                    readonly
                    :ui="{ base: 'scrollbar' }"
                />
            </UCard>
        </div>

        <!-- CENTER: Canvas and iframe -->
        <div class="col-span-5 overflow-y-auto p-4 scrollbar">
            <div class="grid grid-cols-2 gap-4">
                <!-- CANVAS -->
                <div
                    :class="`border border-brand-950/25 dark:border-brand-50/25 bg-brand-100 dark:bg-brand-900 rounded relative w-[${INVITATION_CANVAS_WIDTH}px] h-[${INVITATION_CANVAS_HEIGHT}px]`"
                    @dragover="onCanvasDragOver"
                    @drop="onCanvasDrop"
                >
                    <div
                        v-for="item in containerItems"
                        :key="item.uid"
                        class="absolute cursor-move"
                        :style="{ left: itemPosition(item).x + 'px', top: itemPosition(item).y + 'px' }"
                        @mousedown.prevent="startDrag($event, item)"
                        @click.stop="selectedUid = item.uid"
                    >
                        <div
                            :class="[
                                'py-2 px-4 border border-brand-950/25 dark:border-brand-50/25 hover:bg-brand-100 dark:hover:bg-brand-950 rounded w-52',
                                selectedUid === item.uid ? 'border-brand-500 dark:border-brand-400' : '',
                            ]"
                        >
                            <div class="flex justify-between">
                                {{ availableCards.find(c => c.id === item.id)?.label }}

                                <div class="flex gap-2">
                                    <UButton
                                        size="xs"
                                        label="Dup"
                                        @click.stop="duplicateCard(item)"
                                    />
                                    <UButton
                                        size="xs"
                                        color="error"
                                        label="Del"
                                        @click.stop="removeCard(item.uid)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PREVIEW -->
                <iframe
                    :class="`border border-brand-950/25 dark:border-brand-50/25 rounded w-[${INVITATION_CANVAS_WIDTH}px] h-[${INVITATION_CANVAS_HEIGHT}px]`"
                    :srcdoc="generatedHtml"
                />
            </div>
        </div>

        <!-- RIGHT: Page settings and settings -->
        <div class="flex flex-col gap-4">
            <!-- PAGE SETTINGS -->
            <UCard :ui="{ body: 'p-2 sm:p-3' }">
                <template #header>
                    <h3>Page Settings</h3>
                </template>

                <UFormField label="Background Image">
                    <UFieldGroup>
                        <UInput
                            type="file"
                            accept="image/*"
                            @change="onBgImageUpload"
                        />
                        <UButton
                            v-if="bgImage"
                            icon="lucide:x"
                            @click="clearBgImage"
                        />
                    </UFieldGroup>
                </UFormField>
            </UCard>

            <!-- SETTINGS -->
            <UCard :ui="{ body: 'p-2 sm:p-3' }">
                <template #header>
                    <h3>Block Settings</h3>
                </template>

                <div v-if="selectedItem && selectedBlock">
                    <UFormField
                        v-if="selectedBlock.editableData"
                        label="Content"
                        class="mb-4"
                    >
                        <UInput
                            v-model="selectedItem.data"
                        />
                    </UFormField>

                    <UFormField
                        label="X Position"
                        class="mb-4"
                    >
                        <UInput
                            v-model="selectedItem.x"
                            type="number"
                        />
                    </UFormField>

                    <UFormField
                        label="Y Position"
                        class="mb-4"
                    >
                        <UInput
                            v-model="selectedItem.y"
                            type="number"
                        />
                    </UFormField>

                    <div
                        v-for="(field, index) in selectedBlock.style"
                        :key="field.key"
                        class="mb-4"
                    >
                        <template v-if="selectedBlock.style[index]">
                            <UCheckbox
                                v-if="field.type === 'checkbox'"
                                :model-value="Boolean(getStyleValue(selectedItem.style, field.key))"
                                :label="field.label"
                                @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                            />

                            <UFormField
                                v-else
                                class="mb-2"
                                :label="field.label"
                            >
                                <USelect
                                    v-if="field.type === 'select' && field.options"
                                    :model-value="String(getStyleValue(selectedItem.style, field.key))"
                                    :items="field.options"
                                    class="w-full"
                                    @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                />

                                <UPopover v-else-if="field.type === 'color'">
                                    <UButton
                                        label="Choose color"
                                        color="neutral"
                                        variant="outline"
                                    >
                                        <template #leading>
                                            <span
                                                :style="{ backgroundColor: String(getStyleValue(selectedItem.style, field.key)) }"
                                                class="size-3 rounded-full"
                                            />
                                        </template>
                                    </UButton>

                                    <template #content>
                                        <UColorPicker
                                            :model-value="String(getStyleValue(selectedItem.style, field.key))"
                                            @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e || '#000000')"
                                        />
                                    </template>
                                </UPopover>

                                <UInput
                                    v-else
                                    :type="field.type"
                                    :model-value="String(getStyleValue(selectedItem.style, field.key))"
                                    class="w-full"
                                    @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                />
                            </UFormField>
                        </template>
                    </div>
                </div>

                <div v-else>
                    <span class="text-dimmed">
                        Select a block
                    </span>
                </div>
            </UCard>
        </div>
    </div>
</template>
