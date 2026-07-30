export default defineEventHandler(async (event): Promise<PaymentMethodListResult> => {
    const method = 'GET'
    const path = `/public/order/payment_method`
    const query = getQuery(event)

    const res: PaymentMethodListResult = await api(event, method, path, {
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
