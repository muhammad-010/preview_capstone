// APP
export const APP_NAME = 'Rawooh'

// EMITS
export const EMIT_FORM_CANCEL = 'cancel'
export const EMIT_FORM_SAVE = 'save'
export const EMIT_FORM_NEXT_STEP = 'next-step'
export const EMIT_FORM_PREV_STEP = 'prev-step'
export const EMIT_INPUT_SEARCH = 'search'
export const EMIT_INPUT_CLEAR = 'clear'
export const EMIT_INPUT_UPDATE = 'update'
export const EMIT_MODAL_CONFIRM = 'confirm'
export const EMIT_MODAL_CANCEL = 'cancel'
export const EMIT_MODAL_SELECT = 'select'
export const EMIT_TABLE_REFRESH = 'refresh'
export const EMIT_TABLE_FILTER_OPEN = 'open-filter'
export const EMIT_TABLE_FILTER_CLEAR = 'clear'
export const EMIT_TABLE_EXPORT = 'export'
export const EMIT_TABLE_DISTRIBUTE = 'distribute'
export const EMIT_TABLE_PRINT_QR = 'print-qr'
export const EMIT_TABLE_SEND_QR = 'send-qr'
export const EMIT_TABLE_PRINT_CERTIFICATE = 'print-certificate'
export const EMIT_TABLE_SEND_CERTIFICATE = 'send-certificate'
export const EMIT_TABLE_BULK_DELETE = 'bulk-delete'
export const EMIT_TABLE_OPEN_EDIT = 'open-edit'
export const EMIT_CHECK_IN_SUCCESS = 'success'
export const EMIT_CHECK_IN_FAILED = 'failed'
export const EMIT_QR_DETECT = 'qr-detect'
export const EMIT_LOTTERY_DONE = 'lottery-done'
export const EMIT_DETAIL_REFRESH = 'refresh'
export const EMIT_OPEN_EDIT = 'open-edit'
export const EMIT_OPEN_DISTRIBUTE_HISTORY = 'open-distribute-history'
export const EMIT_EDITOR_REFRESH = 'refresh'

// STATE
export const STATE_LAYOUT_PAGE_TITLE = 'layout:pageTitle'
export const STATE_LAYOUT_PAGE_SUBTITLE = 'layout:pageSubtitle'
export const STATE_LAYOUT_PAGE_BREADCRUMB = 'layout:pageBreadCrumb'
export const STATE_USER_NAVIGATION = 'user:navigation'
export const STATE_USER_ACTIVE_TENANT_INDEX = 'user:activeTenantIndex'
export const STATE_CHECK_IN_EVENT_ID = 'checkIn:eventId'
export const STATE_CHECK_IN_SESSION_ID = 'checkIn:sessionId'
export const STATE_EVENT_DETAIL_ACTIVE_TAB = 'eventDetail:activeTab'
export const STATE_DISTRIBUTE_ACTIVE_TAB = 'distribute:activeTab'

// LOCALSTORAGE
export const LOCALSTORAGE_CHECK_IN_PREVIEW = 'check-in-preview'

// TABLE
export const TABLE_PAGINATION_LIMIT = [5, 10, 25, 50]

// FILENAME
export const FILE_IMPORT_PARTICIPANT = 'bulk_participant.xlsx'

// HTML FILE EXT
export const FILE_EXT_XLSX = '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const SCANNABLE_EVENT = [
    TENANT_EVENT_STATUS_ACTIVE,
    TENANT_EVENT_STATUS_LIVE,
]

export const MAX_PHONE_NUMBER = 13
export const PHONE_NUMBER_PLACEHOLDER = '08xxx'

// DEFAULT ERROR MESSAGE
export const ERROR_SCAN_QR_MESSAGE = 'Failed To Scan QR Code'

// CHECK IN METHOD
export const CHECK_IN_METHOD_SCAN = 'check-in-scan'
export const CHECK_IN_METHOD_MANUAL = 'check-in-manual'

export const CHECK_IN_METHODS = {
    [CHECK_IN_METHOD_SCAN]: 'Scan QR',
    [CHECK_IN_METHOD_MANUAL]: 'Input Phone Number',
}

export const TENANT_EVENT_SETTINGS = {
    [TENANT_EVENT_SETTING_CONFIRMATION_ATTENDANCE]: {
        title: 'Attendees Pax Confirmation',
        desc: 'Enable attendees to insert actual pax after checked-in',
        value: false,
    },
    [TENANT_EVENT_SETTING_PUBLIC_TICKET_RETRIEVAL]: {
        title: 'Public Ticket Retrieval',
        desc: 'Allow attendees to retrieve their ticket/QR code via public link using registered contact, without sign-in',
        value: false,
    },
    [TENANT_EVENT_SETTING_CERTIFICATE]: {
        title: 'Certificate',
        desc: 'Generate certificate for event participants',
        value: false,
    },
}

export const STORE_PRODUCT_TYPES = [
    { label: 'Scheduled', value: STORE_PRODUCT_TYPE_SCHEDULED_SESSION },
]
