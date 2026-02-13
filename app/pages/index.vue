<script setup lang="ts">
definePageMeta({
    layout: 'clean',
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const loaderColor = computed(() => ({
    borderTopColor: isDark.value ? '#eee' : '#111',
    borderLeftColor: isDark.value ? '#eee' : '#111',

    borderBottomColor: isDark.value ? '#111' : '#eee',
    borderRightColor: isDark.value ? '#111' : '#eee',
}))

const { user, loggedIn } = useUserSession()
if (loggedIn.value && user) {
    const role = user.value?.role_slug
    if (!role) {
        throw createError('Invalid role')
    }
    const redirect = defaultRedirect(role)
    if (!redirect) {
        throw createError(`Invalid default redirect for ${role}`)
    }
    navigateTo(redirect)
}
else {
    navigateTo('/auth/login')
}
</script>

<template>
    <div
        class="loader"
        :class="loaderColor"
    />
</template>

<style scoped>
/* https://github.com/barelyhuman/snips/blob/dev/pages/css-loader.md */
.loader {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-radius: 50%;
    -webkit-animation: loader 400ms linear infinite;
    animation: loader 400ms linear infinite;
}
@-webkit-keyframes loader {
    0% {
        -webkit-transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        -webkit-transform: translate(-50%, -50%) rotate(360deg);
    }
}
@keyframes loader {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>
