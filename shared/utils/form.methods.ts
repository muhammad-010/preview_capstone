import type { Tenant, TenantForm, TenantEvent, TenantEventForm } from '../types/data'

export function tenantFormToTenant(data: TenantForm): Tenant {
    return {
        name: data.name,
        status: data.status,
        owner: {
            name: data.owner_name,
            email: data.owner_email,
            password: data.owner_password,
            phone_number: data.owner_phone_number,
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

export function tenantEventFormToTenantEvent(data: TenantEventForm): TenantEvent {
    return {
        name: data.name,
        description: data.description,
        status: data.status,
        location: data.location,
        start_time: data.start_time,
        end_time: data.end_time,
        rule_config: {
            confirmation_attendance: data.confirmation_attendance,
            capacity: {
                total: data.capacity,
            },
        },
        assign_user_ids: data.assign_user_ids,
    } as TenantEvent
}

export function tenantEventToTenantEventForm(data: TenantEvent): TenantEventForm {
    return {
        name: data.name,
        description: data.description,
        status: data.status,
        location: data.location,
        start_time: data.start_time,
        end_time: data.end_time,
        confirmation_attendance: data.rule_config?.confirmation_attendance,
        capacity: data.rule_config?.capacity?.total,
        assign_user_ids: data.assigned_users ? data.assigned_users!.map(u => u.user_id) : [],
    } as TenantEventForm
}
