export default defineNuxtRouteMiddleware((to, _) => {
    if (to.path === '/' || APP_PUBLIC_ROUTE.some(path => to.path.startsWith(path))) {
        return
    }
    const firstSegment = `/${to.path.split('/').filter(Boolean)[0]}`

    const { roleSlug } = useUserState()
    if (!roleRoute(roleSlug.value).includes(firstSegment)) {
        console.log('Access denied to', to.path)
        throw createError({
            statusCode: 403,
            statusMessage: 'Access Denied',
            fatal: true,
        })
    }
})
