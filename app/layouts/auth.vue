<template>
    <div
        class="flex flex-col justify-center items-center min-h-screen w-full px-4 py-8"
        style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; width: 100%;"
    >
        <NuxtImg
            src="/logo.png"
            :width="325"
            class="mb-8"
            style="width: 325px; max-width: 80%; height: auto;"
        />

        <slot />

        <div class="mt-12">
            <UColorModeButton />
        </div>
    </div>
</template>
