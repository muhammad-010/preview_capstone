export interface FetchResult {
    message?: string
    success?: boolean
}

export interface Pagination {
    current_page: number
    last_page: number
    total_data: number
}

export interface DashboardCard {
    count: number
}

export type PaginatedData<T, K extends string> = Pagination & {
    [P in K]: T[]
}

export type AddedData<T, K extends string> = {
    [P in K]: T[]
}

export type Result<T> = FetchResult & {
    data: T
}

export type LoginResult = Result<AuthSession>

export type LogoutResult = FetchResult

// DASHBOARD
export type DashboardTenantListResult = Result<{
    tenants: Tenant[]
}>

export type DashboardCardTotalTenantResult = Result<DashboardCard>

// TENANTS
export type TenantListResult = Result<
    PaginatedData<Tenant, 'tenants'>
>

export type TenantDetailResult = Result<Tenant>

export type TenantFormResult = Result<TenantForm>

export type TenantAddResult = Result<
    AddedData<number, 'tenant_id'>
>

// EVENTS
export type TenantEventListResult = Result<
    PaginatedData<TenantEvent, 'event'>
>

export type TenantEventDetailResult = Result<TenantEvent>

export type TenantEventFormResult = Result<TenantEventForm>

export type TenantEventAddResult = Result<
    AddedData<number, 'event_id'>
>

export type TenantEventUserFound = Result<{
    users: User[]
}>

// EVENT STORE
export type TenantEventStoreDetailResult = Result<TenantEventStore>

export type TenantEventStoreFormResult = Result<TenantEventStoreForm>

export type TenantEventStoreAddResult = Result<
    AddedData<number, 'store_id'>
>

// EVENT PRODUCT
export type TenantEventStoreProductListResult = Result<
    PaginatedData<TenantEventStoreProduct, 'product'>
>

export type TenantEventStoreProductDetailResult = Result<TenantEventStoreProduct>

export type TenantEventStoreProductItemResult = Result<{
    item: TenantEventStoreProductItem[]
}>

export type TenantEventStoreProductAddResult = Result<
    AddedData<number, 'product_id'>
>

// EVENT SESSION
export type TenantEventSessionListResult = Result<
    PaginatedData<TenantEventSession, 'event_session'>
>

export type TenantEventSessionFound = Result<{
    event_session: TenantEventSession[]
}>

export type TenantEventSessionDetailResult = Result<TenantEventSession>

export type TenantEventSessionFormResult = Result<TenantEventSessionForm>

export type TenantEventSessionAddResult = Result<
    AddedData<number, 'event_session_id'>
>

// CUSTOM ATTRIBUTES
export type CustomAttributeListResult = Result<
    PaginatedData<CustomAttribute, 'custom_attribute'>
>

export type CustomAttributeFound = Result<{
    custom_attribute: CustomAttribute[]
}>

export type CustomAttributeAddResult = Result<
    AddedData<number, 'custom_attribute_id'>
>

// EVENT SETTINGS
export type TenantEventSettingResult = Result<TenantEventSetting>

// TEMPLATE
export type ScanPageTemplateResult = Result<Template>

export type TenantEventTemplateResult = Result<{
    template: Template[]
}>

export type TenantEventTemplateVariableResult = Result<{
    variables: TemplateElementDynamicVar[]
}>

export type UploadMediaResult = Result<{
    upload_key: string
}>

export type TemplateFontResult = Result<{
    font: TemplateFont[]
    version: string
}>

// TICKET
export type TenantEventTicketListResult = Result<
    PaginatedData<TenantEventTicket, 'ticket'>
>

export type TenantEventTicketDetailresult = Result<TenantEventTicket>

export type TenantEventTicketFormResult = Result<TenantEventTicketForm>

export type TenantEventTicketAddResult = Result<
    AddedData<number, 'ticket_id'>
>

export type TenantEventTicketPrintQRRequest = {
    ticket_ids?: number[]
}

export type TenantEventTicketPrintQRResult = Result<{
    url: string
}>

export type TenantEventTicketCheckInResult = Result<{
    activity_id: number
    checked_in_at: ISOString
    ticket: {
        ticket_id: number
        owner_name: string
        max_attendance: number
        custom_attributes: CustomAttribute[]
    }
    confirmation_attendance: boolean
}>

export type TenantEventTicketExportRequest = {
    query: string
    custom_attribute?: CustomAttribute[]
    check_in_session?: TenantEventTicketSessionStatus
}

export type TenantEventTicketExportResult = Result<{
    url: string
}>

export type TenantEventTicketAbilityFound = Result<{
    ticket_ability: TenantEventTicketAbility[]
}>

// USER
export type TenantMemberListresult = Result<
    PaginatedData<User, 'user'>
>

export type TenantMemberDetailResult = Result<User>

export type TenantMemberFormResult = Result<UserForm>

export type TenantMemberAddResult = Result<
    AddedData<number, 'user_id'>
>

// ORDER
export type TenantOrderListResult = Result<
    PaginatedData<TenantOrder, 'list'> & {
        summary: TenantOrderSummary
    }
>

export type TenantOrderDetailResult = Result<TenantOrder>

export type PaymentMethodListResult = Result<{
    payment_methods: PaymentMethod[]
}>

// BELOW ARE DEPRECATED

// PARTICIPANTS
export type ParticipantListResult = Result<
    PaginatedData<Participant, 'participant'>
>

export type ParticipantDetailresult = Result<Participant>

export type ParticipantFormResult = Result<ParticipantForm>

export type ParticipantAddResult = Result<
    AddedData<number, 'participant_id'>
>

export type PrintQRRequest = {
    participant_ids?: number[]
}

export type PrintQRResult = Result<{
    filepath: string
}>

export type ParticipantCheckInResult = Result<{
    participant: {
        participant_id: number
        name: string
        max_attendance: number
        custom_attributes: CustomAttribute[]
    }
    confirmation_attendance: boolean
}>

export type ParticipantExportRequest = {
    query: string
    custom_attribute?: CustomAttribute[]
    is_checked_in?: boolean
    phone_number?: string
}

export type ParticipantExportResult = Result<{
    filepath: string
}>
