import type {
    Tenant,
    TenantForm,
    TenantEvent,
    TenantEventForm,
    Participant,
    ParticipantForm,
    User,
    UserForm,
    TenantEventSession,
    TenantEventSessionForm,
    TenantEventStoreProduct,
    TenantEventStoreProductForm,
    CustomAttribute,
    CustomAttributeForm,
    TenantEventTicket,
    TenantEventTicketForm,
} from '../types/data'

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
        assign_user_ids: data.assign_user_ids,
    } as TenantEvent
}

export function tenantEventToTenantEventForm(data: TenantEvent): TenantEventForm {
    return {
        name: data?.name,
        description: data?.description,
        status: data?.status,
        location: data?.location,
        start_time: data?.start_time,
        end_time: data?.end_time,
        assign_user_ids: data?.assigned_users ? data.assigned_users.map(u => u.user_id) : [],
    } as TenantEventForm
}

export function tenantEventSessionToTenantEventSessionForm(data: TenantEventSession): TenantEventSessionForm {
    return {
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
    } as TenantEventSessionForm
}

export function tenantEventSessionFormToTenantEventSession(data: TenantEventSessionForm): TenantEventSession {
    return {
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
    } as TenantEventSession
}

export function tenantEventTicketFormToTenantEventTicket(data: ParticipantForm): TenantEventTicket {
    return {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        phone: {
            number: data.phone_number,
        },
        max_attendance: data.max_attendance,
        custom_attribute: [...(data.custom_attribute ?? [])],
    } as TenantEventTicket
}

export function tenantEventTicketToTenantEventTicketForm(data: TenantEventTicket): TenantEventTicketForm {
    return {
        name: data.name,
        email: data.email,
        phone_number: data.phone
            ? data.phone.number
            : data.phone_number,
        max_attendance: data.max_attendance,
        custom_attribute: [...(data.custom_attribute ?? [])],
    } as TenantEventTicketForm
}

export function userFormToUser(data: UserForm): User {
    return {
        name: data.name,
        email: data.email,
        phone: {
            number: data.phone_number,
        },
        status: data.status,
        tenant_role_id: data.tenant_role_id,
    } as User
}

export function userToUserForm(data: User): UserForm {
    return {
        name: data.name,
        email: data.email,
        phone_number: data.phone?.number,
        status: data.status,
        tenant_role_id: data.tenant_role_id,
    } as UserForm
}

export function customAttributeToCustomAttributeForm(data: CustomAttribute): CustomAttributeForm {
    return {
        name: data.name,
        is_visible: data.is_visible,
    } as CustomAttributeForm
}

export function customAttributeFormToCustomAttribute(data: CustomAttributeForm): CustomAttribute {
    return {
        name: data.name,
        is_visible: data.is_visible,
    } as CustomAttribute
}

export function storeProductToStoreProductForm(data: TenantEventStoreProduct): TenantEventStoreProductForm {
    return {
        name: data.name,
        description: data.description,
        status: data.status,
        price: data.price,
        discount_value: data.discount_value,
        final_price: data.final_price || data.price,
        stock: data.stock_total || 0,
        sale_start_at: data.sale_start_at ? new Date(data.sale_start_at).toISOString() : undefined,
        items: [...data.items],
        raw_items: [...data.items.map(e => `${e.reference_type}-${e.reference_id}`)],
        attributes: [...data.attributes.map(e => e.attribute_id)],
        product_type: STORE_PRODUCT_TYPE_SCHEDULED_SESSION, // HARDCODE
    } as TenantEventStoreProductForm
}

// BELOW ARE DEPRECATED

export function participantFormToParticipant(data: ParticipantForm): Participant {
    return {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        phone: {
            number: data.phone_number,
        },
        max_attendance: data.max_attendance,
        custom_attribute: [...(data.custom_attribute ?? [])],
    } as Participant
}

export function participantToParticipantForm(data: Participant): ParticipantForm {
    return {
        name: data.name,
        email: data.email,
        phone_number: data.phone
            ? data.phone.number
            : data.phone_number,
        max_attendance: data.max_attendance,
        custom_attribute: [...(data.custom_attribute ?? [])],
    } as ParticipantForm
}
