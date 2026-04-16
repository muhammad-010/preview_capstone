<template>
    <UContainer class="flex justify-center items-center flex-col h-screen">
        <NuxtImg
            src="/logo.png"
            :width="325"
            class="mb-8"
        />

        <slot />

        <div class="mt-12">
            <UColorModeButton />
        </div>
    </UContainer>
</template>
