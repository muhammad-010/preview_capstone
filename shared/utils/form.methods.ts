import type { Tenant, TenantForm } from '../types/data'

export function formatTenantForm(body: TenantForm): Tenant {
    return {
        name: body.name,
        status: body.status,
        owner: {
            name: body.owner_name,
            email: body.owner_email,
            password: body.owner_password,
            phone_number: body.owner_phone_number,
        },
    } as Tenant
}
