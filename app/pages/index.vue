<script setup lang="ts">
definePageMeta({
    layout: 'clean',
})

const { loggedIn } = useUserSession()
const { redirect } = useUserState()
if (loggedIn.value && redirect) {
    navigateTo(redirect.value)
}
else {
    navigateTo('/auth/login')
}
</script>

<template>
    <div class="loader" />
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
    border: solid 2px;
    border-color: #111 #eee #eee #111;
    box-sizing: border-box;
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
