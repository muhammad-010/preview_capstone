<script setup lang="ts">
// const eventID = useState(STATE_CHECK_IN_EVENT_ID)
const colorMode = useColorMode()
colorMode.value = 'light'

// TODO: Change this into API call
const bg = {
    // landscape: '/BTN-Event-Landscape.jpg',
    // portrait: '/BTN-Event-Portrait.jpg',
    landscape: '',
    portrait: '',
}
</script>

<template>
    <UContainer
        class="relative flex flex-col justify-center items-center h-screen max-w-full overflow-hidden"
    >
        <div
            v-if="bg.portrait && bg.landscape"
            class="absolute inset-0 bg-cover bg-center blur-2xl brightness-75 scale-110"
            :class="['bg-(image:--bg) lg:bg-(image:--lg-bg)']"
            :style="{
                '--bg': `url(${bg.portrait})`,
                '--lg-bg': `url(${bg.landscape})`,
            }"
        />

        <div
            v-else
            class="absolute inset-0 bg-linear-to-br from-blue-200 via-gray-50 to-indigo-200"
        />

        <div
            class="absolute inset-0 bg-contain bg-center bg-no-repeat"
            :class="['bg-(image:--bg) lg:bg-(image:--lg-bg)']"
            :style="{
                '--bg': `url(${bg.portrait})`,
                '--lg-bg': `url(${bg.landscape})`,
            }"
        />

        <div class="relative">
            <slot />
        </div>
    </UContainer>
</template>
