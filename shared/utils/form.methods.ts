import type { Tenant, TenantForm } from '../types/data'

export function tenantFormToTenant(body: TenantForm): Tenant {
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

export function tenantToTenantForm(data: Tenant): TenantForm {
    return {
        name: data.name,
        status: data.status,
        owner_name: data.owner.name,
        owner_email: data.owner.email,
        owner_phone_number: data.owner.phone.number,
        plan_id: 1, // HARDCODE
    } as TenantForm
}
