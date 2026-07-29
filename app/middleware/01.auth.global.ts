export default defineNuxtRouteMiddleware((to, _) => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value && !APP_PUBLIC_ROUTE.some(path => to.path.startsWith(path))) {
        return navigateTo(APP_UNAUTHORIZED_REDIRECT)
    }
    if (loggedIn.value && to.path.startsWith('/auth')) {
        return navigateTo('/')
    }
})
