<script setup lang="ts">
const colorMode = useColorMode()
colorMode.value = 'light'

const props = defineProps<{
    smBackground?: string
    mdBackground?: string
    lgBackground?: string
    xlBackground?: string
}>()

const isBackgroundActive = computed(() => {
    return Boolean(props.smBackground)
        && Boolean(props.mdBackground)
        && Boolean(props.lgBackground)
        && Boolean(props.xlBackground)
})

const backgroundStyleClass = computed<LayoutBackgroundSetting>(() => {
    const res: LayoutBackgroundSetting = {
        tailwindClass: [],
        style: {},
    }
    if (props.smBackground) {
        res.style['--sm-bg'] = `url(${props.smBackground})`
        res.tailwindClass.push('sm:bg-(--sm-bg)')
    }
    if (props.mdBackground) {
        res.style['--md-bg'] = `url(${props.mdBackground})`
        res.tailwindClass.push('md:bg-(--md-bg)')
    }
    if (props.lgBackground) {
        res.style['--lg-bg'] = `url(${props.lgBackground})`
        res.tailwindClass.push('lg:bg-(--lg-bg)')
    }
    if (props.xlBackground) {
        res.style['--xl-bg'] = `url(${props.xlBackground})`
        res.tailwindClass.push('xl:bg-(--xl-bg)')
    }

    return res
})
</script>

<template>
    <UContainer
        class="relative flex flex-col justify-center items-center h-screen max-w-full overflow-hidden"
    >
        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-cover bg-center blur-2xl brightness-75 scale-110"
            :class="backgroundStyleClass.tailwindClass"
            :style="backgroundStyleClass.style"
        />

        <div
            v-else
            class="absolute inset-0 bg-linear-to-br from-blue-200 via-gray-50 to-indigo-200"
        />

        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-contain bg-center bg-no-repeat"
            :class="backgroundStyleClass.tailwindClass"
            :style="backgroundStyleClass.style"
        />

        <div class="z-1">
            <slot />
        </div>
    </UContainer>
</template>
