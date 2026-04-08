<script setup lang="ts">
type FacingMode = 'Rear' | 'Front'
const FACING_MODE_REAR: FacingMode = 'Rear'
const FACING_MODE_FRONT: FacingMode = 'Front'
const facingModeOptions: Record<FacingMode, string> = {
    [FACING_MODE_REAR]: 'environment',
    [FACING_MODE_FRONT]: 'user',
}
const selectedFacingMode = ref<FacingMode>(FACING_MODE_REAR)
const selectedConstraints = computed(() => ({ facingMode: facingModeOptions[selectedFacingMode.value] }))
function inverseFacingModeCamera(): FacingMode {
    return selectedFacingMode.value === FACING_MODE_REAR
        ? FACING_MODE_FRONT
        : FACING_MODE_REAR
}
function switchFacingModeCamera() {
    selectedFacingMode.value = inverseFacingModeCamera()
}

const mirrorCamera = ref(true)

const pauseQr = defineModel<boolean>('pause-qr', { default: false })
</script>

<template>
    <div class="flex flex-col items-center gap-4">
        <div
            class="scanner max-w-80 xl:max-w-100 2xl:max-w-120"
            :class="{
                'mirror-camera': mirrorCamera,
            }"
        >
            <QrcodeStream
                :paused="pauseQr"
                :constraints="selectedConstraints"
            />
        </div>
        <div class="flex gap-4">
            <UButton
                color="neutral"
                class="rounded-full"
                :label="`Switch to ${inverseFacingModeCamera()} Camera`"
                @click="switchFacingModeCamera"
            />
            <UButton
                color="neutral"
                class="rounded-full"
                :label="`Mirror Camera ${mirrorCamera ? 'On' : 'Off'}`"
                @click="mirrorCamera = !mirrorCamera"
            />
        </div>
    </div>
</template>

<style scoped>
.scanner {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  margin: auto;
  overflow: hidden;
}

:deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.5);
}

.mirror-camera :deep(video) {
  transform: scaleX(-1) scale(1.5);
}
</style>
