export default defineEventHandler(async (event): Promise<TenantAddResult> => {
    const method = 'POST'
    const path = '/tenant'
    const rawbody = await readBody(event)
    const body = tenantFormToTenant(rawbody)

    const res: TenantAddResult = await api(event, method, path, {
        body,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
