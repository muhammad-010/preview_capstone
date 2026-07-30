export default defineEventHandler(async (event): Promise<TenantOrderDetailResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const orderId = getRouterParam(event, 'order_id')
    const path = `/tenant/${tenantId}/order/${orderId}/detail`

    const res: TenantOrderDetailResult = await api(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
