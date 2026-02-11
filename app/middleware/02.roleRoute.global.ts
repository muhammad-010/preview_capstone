export default defineNuxtRouteMiddleware((to, _) => {
    if (to.path === '/' || to.path.startsWith('/auth')) {
        return
    }
    const firstSegment = `/${to.path.split('/').filter(Boolean)[0]}`

    const { user } = useUserSession()
    const role = user.value?.role_slug
    if (!role) {
        throw createError('Invalid role')
    }
    const roleRoute = ROLE_ROUTES[role]

    if (!roleRoute.includes(firstSegment)) {
        console.log('Access denied to', to.path)
        throw createError({
            status: 403,
            statusText: 'Access Denied',
            fatal: true,
        })
    }
})
