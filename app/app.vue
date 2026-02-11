<template>
    <UApp>
        <UMain class="min-h-screen">
            <NuxtLoadingIndicator
                color="repeating-linear-gradient(
                    to right,
                    var(--color-brand-300) 0%,
                    var(--color-brand-500) 50%,
                    var(--color-brand-700) 100%
                )"
            />
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </UMain>
    </UApp>
</template>
