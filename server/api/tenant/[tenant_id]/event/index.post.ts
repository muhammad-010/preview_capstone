export default defineEventHandler(async (event): Promise<TenantEventAddResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/event`
    const rawbody = await readBody(event)
    const body = tenantEventFormToTenantEvent(rawbody)

    const res: TenantEventAddResult = await externalApi(event, method, path, {
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
