export default defineEventHandler(async (event): Promise<DistributeListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const notificationRecipientId = getRouterParam(event, 'notification_recipient_id')
    const path = `/tenant/${tenantId}/distribute/recipient/${notificationRecipientId}/history`
    const query = getQuery(event)

    const res: DistributeListResult = await api(event, method, path, {
        query,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
