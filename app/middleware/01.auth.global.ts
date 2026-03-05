export default defineNuxtRouteMiddleware((to, _) => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value && !to.path.startsWith('/auth')) {
        return navigateTo(APP_UNAUTHORIZED_REDIRECT)
    }
    if (loggedIn.value && to.path.startsWith('/auth')) {
        return navigateTo('/')
    }
})
