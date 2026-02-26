export default defineEventHandler(async (event): Promise<TenantMemberAddResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/user`
    const body = await readBody(event)

    const res: TenantMemberAddResult = await api(event, method, path, {
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
