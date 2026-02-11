export default defineEventHandler(async (event): Promise<FetchResult> => {
    await clearUserSession(event)
    return { message: 'Logout successful' }
    // const res: LogoutResult = await externalApi(event, 'POST', '/auth/logout')
    // if (res.success) {
    //     await clearUserSession(event)
    //     return { message: 'Logout successful' }
    // }
    // else {
    //     console.log('Logout failed:', res)
    //     return { message: 'Logout failed' }
    // }
})
