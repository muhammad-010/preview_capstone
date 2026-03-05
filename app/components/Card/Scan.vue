<script setup lang="ts">
import type { DetectedBarcode } from 'nuxt-qrcode'

defineProps<{
    eventName: string
    tenant: string
    startDate: string
    startHour: string
    location: string
}>()
const pauseQr = defineModel<boolean>('pause-qr', { default: false })
const emit = defineEmits([EMIT_QR_DETECT])
const toast = useToast()

function onDetect(detectedBarCodes: DetectedBarcode[]) {
    pauseQr.value = true
    emit(EMIT_QR_DETECT, detectedBarCodes)
}

function onError(error: Error) {
    let desc = 'Failed to read QR'
    switch (error.name) {
        case 'NotAllowedError':
            desc = 'Can not access camera'
            break
        case 'NotFoundError':
            desc = 'No camera found'
            break
        case 'StreamApiNotSupportedError':
            desc = 'Can not scan using this browser'
            break
        default:
            break
    }
    toast.add({
        title: 'Error',
        description: desc,
        color: 'error',
    })
    console.error(desc, error)
}
</script>

<template>
    <div>
        <UCard
            class="mb-8 py-4 px-6"
            :ui="{
                root: 'dark:bg-gradient-to-br dark:from-[#2f3f8f] dark:via-[#3b5bbf] dark:to-[#4f86e8] bg-gradient-to-br from-[#3b5bdb] via-[#4c6ef5] to-[#74c0fc] text-white',
            }"
        >
            <section class="text-center mb-8">
                <h1 class="mb-8 text-4xl">
                    {{ eventName }}
                </h1>
                <h4 class="text-2xl">
                    We're excited to have you here!
                </h4>
            </section>

            <section class="bg-primary-950/20 dark:bg-primary-50/15 rounded-xl grid grid-cols-3 gap-8 justify-items-center py-8 px-24 text-xl mb-8">
                <div class="col-span-3 flex items-center">
                    <UIcon
                        name="lucide:building"
                        class=" size-8"
                    />
                    <span class="ml-2">
                        {{ tenant }}
                    </span>
                </div>
                <div class="flex items-center">
                    <UIcon
                        name="lucide:calendar"
                        class=" size-8"
                    />
                    <span class="ml-2">
                        {{ startDate }}
                    </span>
                </div>
                <div class="flex items-center">
                    <UIcon
                        name="lucide:clock"
                        class=" size-8"
                    />
                    <span class="ml-2">
                        {{ startHour }}
                    </span>
                </div>
                <div class="flex items-center">
                    <UIcon
                        name="lucide:map-pin"
                        class=" size-8"
                    />
                    <span class="ml-2">
                        {{ location }}
                    </span>
                </div>
            </section>

            <section class="text-center">
                Please scan your QR code below to check in
            </section>
        </UCard>

        <div class="scanner">
            <QrcodeStream
                :paused="pauseQr"
                @error="onError"
                @detect="onDetect"
            />
        </div>
    </div>
</template>

<style scoped>
.scanner {
  position: relative;
  width: 100%;
  max-width: 450px;
  aspect-ratio: 1 / 1;
  margin: auto;
  border-radius: 16px;
  overflow: hidden;
}

:deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1) scale(1.5);
}

.overlay {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(255,255,255,0.6);
  pointer-events: none;
}
</style>
