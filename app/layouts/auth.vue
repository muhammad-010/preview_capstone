<template>
    <div class="flex flex-col justify-center items-center min-h-screen w-full px-4 py-8">
        <NuxtImg
            src="/logo.png"
            :width="325"
            class="mb-8"
        />

        <slot />

        <div class="mt-12">
            <UColorModeButton />
        </div>
    </div>
</template>
