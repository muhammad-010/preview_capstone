export default defineEventHandler(async (event): Promise<TenantDetailResult> => {
    const method = 'GET'
    const filepath = getRouterParam(event, 'filepath')
    const path = `/files/${filepath}`

    const res: TenantDetailResult = await externalApi(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
