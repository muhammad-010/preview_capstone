import type {
    Status,
    TenantEventStatus,
    ParticipantStatus,
    ParticipantCategory,
    SendChannel,
    InvitationStatus,
    ParticipantSessionStatus,
    TenantEventSettingKeys,
    TemplateType,
    StoreProductType,
    TenantOrderStatus,
    TenantPaymentStatus,
    TenantEventTicketStatus,
    TenantEventTicketSessionStatus,
    DistributeChannel,
    DistributeType,
    DistributeStatus,
    DistributeRefType,
    TenantEventTicketNotification,
} from '../types/data'

// STATUS
export const STATUS_ACTIVE: Status = 'Active'
export const STATUS_INACTIVE: Status = 'Inactive'

export const STATUS_DROPDOWN: Status[] = [
    STATUS_ACTIVE,
    STATUS_INACTIVE,
]

export const STATUS_COLORS: Record<Status, 'success' | 'error'> = {
    [STATUS_ACTIVE]: 'success',
    [STATUS_INACTIVE]: 'error',
} as const

// TENANT_EVENT_STATUS
export const TENANT_EVENT_STATUS_ACTIVE: TenantEventStatus = 'Active'
export const TENANT_EVENT_STATUS_UPCOMING: TenantEventStatus = 'Upcoming'
export const TENANT_EVENT_STATUS_LIVE: TenantEventStatus = 'Live'
export const TENANT_EVENT_STATUS_COMPLETED: TenantEventStatus = 'Completed'

export const TENANT_EVENT_STATUS_DROPDOWN: TenantEventStatus[] = [
    TENANT_EVENT_STATUS_ACTIVE,
    TENANT_EVENT_STATUS_UPCOMING,
    TENANT_EVENT_STATUS_LIVE,
    TENANT_EVENT_STATUS_COMPLETED,
]

export const TENANT_EVENT_STATUS_COLORS: Record<
    TenantEventStatus, 'success' | 'error' | 'primary' | 'neutral' | 'info' | 'warning'
> = {
    [TENANT_EVENT_STATUS_ACTIVE]: 'success',
    [TENANT_EVENT_STATUS_UPCOMING]: 'warning',
    [TENANT_EVENT_STATUS_LIVE]: 'success',
    [TENANT_EVENT_STATUS_COMPLETED]: 'primary',
} as const

// TENANT_EVENT_SETTINGS
export const TENANT_EVENT_SETTING_CONFIRMATION_ATTENDANCE: TenantEventSettingKeys = 'confirmation_attendance'
export const TENANT_EVENT_SETTING_PUBLIC_TICKET_RETRIEVAL: TenantEventSettingKeys = 'public_ticket_retrieval'
export const TENANT_EVENT_SETTING_CERTIFICATE: TenantEventSettingKeys = 'certificate'
export const TENANT_EVENT_SETTING_DROPDOWN: TenantEventSettingKeys[] = [
    TENANT_EVENT_SETTING_CONFIRMATION_ATTENDANCE,
    TENANT_EVENT_SETTING_PUBLIC_TICKET_RETRIEVAL,
    TENANT_EVENT_SETTING_CERTIFICATE,
]

// TICKET_STATUS
export const TICKET_STATUS_CHECKED_IN: TenantEventTicketStatus = 'Checked In'
export const TICKET_STATUS_PENDING: TenantEventTicketStatus = 'Pending'

export const TICKET_STATUS_DROPDOWN: TenantEventTicketStatus[] = [
    TICKET_STATUS_CHECKED_IN,
    TICKET_STATUS_PENDING,
]

export const TICKET_STATUS_COLORS: Record<TenantEventTicketStatus, 'success' | 'neutral'> = {
    [TICKET_STATUS_CHECKED_IN]: 'success',
    [TICKET_STATUS_PENDING]: 'neutral',
} as const

// TICKET_SESSION_STATUS
export const TICKET_SESSION_STATUS_NONE: TenantEventTicketSessionStatus = 'none'
export const TICKET_SESSION_STATUS_PARTIAL: TenantEventTicketSessionStatus = 'partial'
export const TICKET_SESSION_STATUS_COMPLETED: TenantEventTicketSessionStatus = 'completed'

export const TICKET_SESSION_STATUS_DROPDOWN: TenantEventTicketSessionStatus[] = [
    TICKET_SESSION_STATUS_NONE,
    TICKET_SESSION_STATUS_PARTIAL,
    TICKET_SESSION_STATUS_COMPLETED,
]

export const TICKET_SESSION_STATUS_COLORS: Record<TenantEventTicketSessionStatus, 'neutral' | 'info' | 'success'> = {
    [TICKET_SESSION_STATUS_NONE]: 'neutral',
    [TICKET_SESSION_STATUS_PARTIAL]: 'info',
    [TICKET_SESSION_STATUS_COMPLETED]: 'success',
} as const

// TICKET_INVITATION_STATUS
export const INVITATION_STATUS_ON_QUEUE = 'queue'
export const INVITATION_STATUS_SUCCESS = 'success'
export const INVITATION_STATUS_FAILED = 'failed'

export const INVITATION_STATUS_COLORS: Record<InvitationStatus, 'warning' | 'success' | 'error'> = {
    [INVITATION_STATUS_ON_QUEUE]: 'warning',
    [INVITATION_STATUS_SUCCESS]: 'success',
    [INVITATION_STATUS_FAILED]: 'error',
}

// SEND_CHANNEL
export const SEND_CHANNEL_EMAIL = 'email'
export const SEND_CHANNEL_WHATSAPP = 'whatsapp'

export const SEND_CHANNEL_DROPDOWN: SendChannel[] = [
    SEND_CHANNEL_EMAIL,
    SEND_CHANNEL_WHATSAPP,
]

export const SEND_CHANNEL_COLORS: Record<SendChannel, 'neutral' | 'success'> = {
    [SEND_CHANNEL_EMAIL]: 'neutral',
    [SEND_CHANNEL_WHATSAPP]: 'success',
} as const

// EVENT_TEMPLATE
export const TEMPLATE_INVITATION: TemplateType = 'invitation'
export const TEMPLATE_SCANQR: TemplateType = 'scanqr'
export const TEMPLATE_CERTIFICATE: TemplateType = 'certificate'

// STORE_PRODUCT_TYPE
export const STORE_PRODUCT_TYPE_SCHEDULED_SESSION: StoreProductType = 'scheduled-session'

// ORDER_STATUS
export const TENANT_ORDER_STATUS_LIST: { label: TenantOrderStatus, value: TenantOrderStatus, description?: string }[] = [
    { label: 'Success', value: 'Success' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Waiting Payment', value: 'Waiting Payment' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
]
export const TENANT_ORDER_STATUS_ENUM = {
    'Waiting Payment': 1,
    'Pending': 2,
    'Success': 3,
    'Failed': 4,
    'Waiting Refund': 5,
    'Refunded': 6,
} as const
export const TENANT_ORDER_STATUS_COLORS: Record<
    TenantOrderStatus, 'success' | 'error' | 'primary' | 'neutral' | 'info' | 'warning' | 'secondary'
> = {
    ['Success']: 'success',
    ['Failed']: 'error',
    ['Refunded']: 'secondary',
    ['Pending']: 'warning',
    ['Waiting Payment']: 'info',
} as const

// PAYMENT_STATUS
export const TENANT_PAYMENT_STATUS_LIST: { label: TenantPaymentStatus, value: TenantPaymentStatus, description?: string }[] = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
]
export const TENANT_PAYMENT_STATUS_ENUM = {
    'Pending': 1,
    'Paid': 2,
    'Failed': 3,
    'Expired': 4,
    'Refund Pending': 5,
    'Refunded': 6,
} as const
export const TENANT_PAYMENT_STATUS_COLORS: Record<
    TenantPaymentStatus, 'success' | 'error' | 'primary' | 'neutral' | 'info' | 'warning' | 'secondary'
> = {
    ['Paid']: 'success',
    ['Failed']: 'error',
    ['Refunded']: 'secondary',
    ['Pending']: 'warning',
    ['Expired']: 'neutral',
} as const

// DISTRIBUTE
export const DISTRIBUTE_CHANNEL_EMAIL: DistributeChannel = 'email'
export const DISTRIBUTE_CHANNEL_WHATSAPP: DistributeChannel = 'whatsapp'

export const DISTRIBUTE_CHANNEL_DROPDOWN: DistributeChannel[] = [
    DISTRIBUTE_CHANNEL_EMAIL,
    DISTRIBUTE_CHANNEL_WHATSAPP,
]

export const DISTRIBUTE_CHANNEL_COLORS: Record<DistributeChannel, 'success' | 'info'> = {
    [DISTRIBUTE_CHANNEL_WHATSAPP]: 'success',
    [DISTRIBUTE_CHANNEL_EMAIL]: 'info',
} as const

export const DISTRIBUTE_TYPE_INVITATION: DistributeType = 'invitation'
export const DISTRIBUTE_TYPE_CERTIFICATE: DistributeType = 'certificate'
export const DISTRIBUTE_TYPE_INVOICE: DistributeType = 'invoice'

export const DISTRIBUTE_TYPE_ENUM = {
    invitation: 1,
    certificate: 2,
    invoice: 3,
} as const

export const DISTRIBUTE_TYPE_VALID_CHANNEL_DROPDOWN: Record<DistributeType, DistributeChannel[]> = {
    [DISTRIBUTE_TYPE_INVITATION]: [DISTRIBUTE_CHANNEL_EMAIL, DISTRIBUTE_CHANNEL_WHATSAPP],
    [DISTRIBUTE_TYPE_CERTIFICATE]: [DISTRIBUTE_CHANNEL_EMAIL],
    [DISTRIBUTE_TYPE_INVOICE]: [DISTRIBUTE_CHANNEL_EMAIL],
}

export const DISTRIBUTE_PARTICIPANT_NOTIFICATION_INVITATION: TenantEventTicketNotification = `event-${DISTRIBUTE_TYPE_INVITATION}`
export const DISTRIBUTE_PARTICIPANT_NOTIFICATION_CERTIFICATE: TenantEventTicketNotification = `event-${DISTRIBUTE_TYPE_CERTIFICATE}`
export const DISTRIBUTE_PARTICIPANT_NOTIFICATION_INVOICE: TenantEventTicketNotification = `order-${DISTRIBUTE_TYPE_INVOICE}`

export const DISTRIBUTE_PARTICIPANT_NOTIFICATION_LABEL = {
    [DISTRIBUTE_PARTICIPANT_NOTIFICATION_INVITATION]: formatCapitalize(DISTRIBUTE_TYPE_INVITATION),
    [DISTRIBUTE_PARTICIPANT_NOTIFICATION_CERTIFICATE]: formatCapitalize(DISTRIBUTE_TYPE_CERTIFICATE),
    [DISTRIBUTE_PARTICIPANT_NOTIFICATION_INVOICE]: formatCapitalize(DISTRIBUTE_TYPE_INVOICE),
}

export const DISTRIBUTE_STATUS_IN_QUEUE: DistributeStatus = 'in_queue'
export const DISTRIBUTE_STATUS_SUCCESS: DistributeStatus = 'success'
export const DISTRIBUTE_STATUS_FAILED: DistributeStatus = 'failed'
export const DISTRIBUTE_STATUS_SENT: DistributeStatus = 'sent'
export const DISTRIBUTE_STATUS_NOT_SENT: DistributeStatus = 'not_sent'

export const DISTRIBUTE_STATUS_ENUM = {
    in_queue: 1,
    success: 2,
    failed: 3,
    not_sent: 4,
    sent: 5,
} as const

export const DISTRIBUTE_STATUS_DROPDOWN: DistributeStatus[] = [
    DISTRIBUTE_STATUS_IN_QUEUE,
    DISTRIBUTE_STATUS_SUCCESS,
    DISTRIBUTE_STATUS_FAILED,
    DISTRIBUTE_STATUS_SENT,
    DISTRIBUTE_STATUS_NOT_SENT,
]

export const DISTRIBUTE_STATUS_COLORS: Record<DistributeStatus, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
    [DISTRIBUTE_STATUS_IN_QUEUE]: 'neutral',
    [DISTRIBUTE_STATUS_SENT]: 'info',
    [DISTRIBUTE_STATUS_NOT_SENT]: 'warning',
    [DISTRIBUTE_STATUS_SUCCESS]: 'success',
    [DISTRIBUTE_STATUS_FAILED]: 'error',
} as const

export const DISTRIBUTE_REF_TYPE_EVENTS: DistributeRefType = 'events'
export const DISTRIBUTE_REF_TYPE_ORDERS: DistributeRefType = 'orders'

export const DISTRIBUTE_REF_TYPE_DROPDOWN: DistributeRefType[] = [
    DISTRIBUTE_REF_TYPE_EVENTS,
    DISTRIBUTE_REF_TYPE_ORDERS,
]

// BELOW ARE DEPRECATED

// PARTICIPANT_STATUS
export const PARTICIPANT_STATUS_CHECKED_IN: ParticipantStatus = 'Checked In'
export const PARTICIPANT_STATUS_PENDING: ParticipantStatus = 'Pending'

export const PARTICIPANT_STATUS_DROPDOWN: ParticipantStatus[] = [
    PARTICIPANT_STATUS_CHECKED_IN,
    PARTICIPANT_STATUS_PENDING,
]

export const PARTICIPANT_STATUS_COLORS: Record<ParticipantStatus, 'success' | 'neutral'> = {
    [PARTICIPANT_STATUS_CHECKED_IN]: 'success',
    [PARTICIPANT_STATUS_PENDING]: 'neutral',
} as const

// PARTICIPANT_SSESSION_STATUS
export const PARTICIPANT_SESSION_STATUS_NONE: ParticipantSessionStatus = 'none'
export const PARTICIPANT_SESSION_STATUS_PARTIAL: ParticipantSessionStatus = 'partial'
export const PARTICIPANT_SESSION_STATUS_COMPLETED: ParticipantSessionStatus = 'completed'

export const PARTICIPANT_SESSION_STATUS_DROPDOWN: ParticipantSessionStatus[] = [
    PARTICIPANT_SESSION_STATUS_NONE,
    PARTICIPANT_SESSION_STATUS_PARTIAL,
    PARTICIPANT_SESSION_STATUS_COMPLETED,
]

export const PARTICIPANT_SESSION_STATUS_COLORS: Record<ParticipantSessionStatus, 'neutral' | 'info' | 'success'> = {
    [PARTICIPANT_SESSION_STATUS_NONE]: 'neutral',
    [PARTICIPANT_SESSION_STATUS_PARTIAL]: 'info',
    [PARTICIPANT_SESSION_STATUS_COMPLETED]: 'success',
} as const

// PARTICIPANT_CATEGORY
export const PARTICIPANT_CATEGORY_VIP = 'VIP'
export const PARTICIPANT_CATEGORY_REGULAR = 'Regular'

export const PARTICIPANT_CATEGORY_DROPDOWN: ParticipantCategory[] = [
    PARTICIPANT_CATEGORY_VIP,
    PARTICIPANT_CATEGORY_REGULAR,
]

export const PARTICIPANT_CATEGORY_COLORS: Record<ParticipantCategory, 'warn' | 'neutral'> = {
    [PARTICIPANT_CATEGORY_VIP]: 'warn',
    [PARTICIPANT_CATEGORY_REGULAR]: 'neutral',
} as const
