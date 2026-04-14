<script setup lang="ts">
const CHECK_IN_METHOD_SCAN = 'scan-qr'
const CHECK_IN_METHOD_MANUAL = 'input-manual'
const checkInMethods = {
    [CHECK_IN_METHOD_SCAN]: 'Scan QR',
    [CHECK_IN_METHOD_MANUAL]: 'Input Phone Number',
}
const checkInMethodDialog = ref(true)
const activeCheckInMethod = ref<typeof CHECK_IN_METHOD_SCAN | typeof CHECK_IN_METHOD_MANUAL | null>(null)
const inverseCheckInMethodLabel = computed(() => {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_SCAN:
            return `Switch to ${checkInMethods[CHECK_IN_METHOD_MANUAL]}`
        case CHECK_IN_METHOD_MANUAL:
            return `Switch to ${checkInMethods[CHECK_IN_METHOD_SCAN]}`
        default:
            return 'No check-in method selected'
    }
})
function checkInQr() {
    activeCheckInMethod.value = CHECK_IN_METHOD_SCAN
    checkInMethodDialog.value = false
}
function checkInManual() {
    activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
    checkInMethodDialog.value = false
}
function switchCheckInMethod() {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_SCAN:
            activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
            break
        case CHECK_IN_METHOD_MANUAL:
            activeCheckInMethod.value = CHECK_IN_METHOD_SCAN
            break
        default:
            break
    }
}

const confirmAttendanceDialog = ref(false)
const participant = ref({
    name: '',
    maxAttendance: 0,
})

async function useScanQr() {
    const pauseQr = ref(false)

    return {
        pauseQr,
    }
}

const [
    {
        pauseQr,
    },
] = await Promise.all([
    useScanQr(),
])

definePageMeta({
    layout: 'check-in-preview',
})

const settings = ref<SavedSetttings>({
    bgPortraitDataURL: '',
    bgLandscapeDataURL: '',
    customBlock: [],
    staticBlock: [],
})

function getStaticBlockStyle(id: string) {
    if (!import.meta.client) return ''

    const block = settings.value.staticBlock.find(b => b.id === id)
    if (!block) return ''

    const pos = isMobile.value
        ? block.portraitPos
        : block.landscapePos

    return `
        position: absolute;
        left: ${pos.x}%;
        top: ${pos.y}%;
        transform: translate(-50%, -50%);
    `
}

const isMobile = ref(false)

function getLocalStorage<T>(key: string): T | null {
    if (!import.meta.client) return null

    try {
        const value = localStorage.getItem(key)
        return value ? (JSON.parse(value) as T) : null
    }
    catch {
        return null
    }
}

onMounted(() => {
    const rawSettings = getLocalStorage<SavedSetttings>('editor-config')
    if (rawSettings) {
        settings.value = rawSettings
    }

    const media = window.matchMedia('(max-width: 1024px)')

    const update = () => (isMobile.value = media.matches)
    update()

    media.addEventListener('change', update)
})
</script>

<template>
    <div>
        <MiscBlockLoader
            :block-settings="settings.customBlock"
        />

        <div
            v-if="activeCheckInMethod === CHECK_IN_METHOD_SCAN"
            :style="getStaticBlockStyle('qr-code')"
        >
            <div class="flex justify-center mb-2">
                <UButton
                    color="neutral"
                    :label="inverseCheckInMethodLabel"
                    @click="switchCheckInMethod"
                />
            </div>

            <CheckInScanPreview v-model:pause-qr="pauseQr" />
        </div>

        <div
            v-else-if="activeCheckInMethod === CHECK_IN_METHOD_MANUAL"
            :style="getStaticBlockStyle('input-card')"
        >
            <div class="flex justify-center mb-2">
                <UButton
                    color="neutral"
                    :label="inverseCheckInMethodLabel"
                    @click="switchCheckInMethod"
                />
            </div>

            <CheckInManualPreview
                title="Manual Check In"
                button-label="Check In"
            />
        </div>

        <UModal
            v-model:open="confirmAttendanceDialog"
            :dismissible="false"
        >
            <template #header>
                <div>
                    <h2 class="text-highlighted font-semibold">
                        Confirm Attendance
                    </h2>
                </div>
            </template>
            <template #body>
                <div class="flex flex-col p-4">
                    <div class="text-center mb-8">
                        <div class="text-2xl">
                            Please confirm guests attendance for {{ participant.name }}
                        </div>
                        <div class="text-xl">
                            (Max {{ participant.maxAttendance }})
                        </div>
                    </div>

                    <UForm
                        class="flex flex-col items-center"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="text-lg mb-8"
                        >
                            <UInput
                                :ui="{
                                    base: 'px-4 py-4 text-5xl text-center gap-2',
                                    leading: 'ps-4',
                                    trailing: 'pe-4',
                                }"
                            >
                                <template #leading>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:minus"
                                        size="xl"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                    />
                                </template>
                            </UInput>
                        </UFormField>
                        <button
                            type="submit"
                            class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        >
                            Check In
                        </button>
                    </UForm>
                </div>
            </template>
        </UModal>

        <UModal
            v-model:open="checkInMethodDialog"
            :dismissible="false"
        >
            <template #content>
                <div class="flex flex-col gap-6 p-6">
                    <div>
                        <h2>Please select check-in method</h2>
                    </div>

                    <button
                        class="cursor-pointer bg-success text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInQr"
                    >
                        Scan QR
                    </button>

                    <button
                        class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInManual"
                    >
                        Input Phone Number
                    </button>
                </div>
            </template>
        </UModal>
    </div>
</template>
