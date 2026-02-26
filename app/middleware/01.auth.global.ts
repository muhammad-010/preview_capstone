export default defineNuxtRouteMiddleware((to, _) => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value && !to.path.startsWith('/auth')) {
        return navigateTo('/auth/login')
    }
    if (loggedIn.value && to.path.startsWith('/auth')) {
        return navigateTo('/')
    }
})
