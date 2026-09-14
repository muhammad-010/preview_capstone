export default defineEventHandler(async (event) => {
    if (process.env.NODE_ENV !== 'development') return
    
    // Automatically inject a superadmin session if it doesn't exist
    const session = await getUserSession(event)
    if (!session?.user) {
        await setUserSession(event, {
            user: {
                id: 999,
                name: 'Local Superadmin',
                avatar_url: null,
                assigned_tenant: [
                    {
                        id: 1,
                        name: 'System',
                        role_slug: 'superadmin'
                    }
                ]
            },
            secure: {
                access_token: 'local-dummy-token',
            }
        })
    }
})
