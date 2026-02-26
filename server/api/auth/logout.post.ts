export default defineEventHandler(async (event): Promise<FetchResult> => {
    await clearUserSession(event)
    return { message: 'Logout successful' }
})
