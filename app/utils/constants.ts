// APP
export const APP_NAME = 'Rawooh'

// EMITS
export const EMIT_FORM_CANCEL = 'cancel'
export const EMIT_FORM_SAVE = 'save'
export const EMIT_FORM_NEXT_STEP = 'next-step'
export const EMIT_FORM_PREV_STEP = 'prev-step'
export const EMIT_INPUT_SEARCH = 'search'
export const EMIT_INPUT_CLEAR = 'clear'
export const EMIT_MODAL_CONFIRM = 'confirm'
export const EMIT_MODAL_CANCEL = 'cancel'
export const EMIT_TABLE_REFRESH = 'refresh'
export const EMIT_QR_DETECT = 'qr-detect'
export const EMIT_LOTTERY_DONE = 'lottery-done'
export const EMIT_MODAL_SELECT = 'select'
export const EMIT_DETAIL_ACTIVATE = 'activate'
export const EMIT_DETAIL_DEACTIVATE = 'deactivate'
export const EMIT_DETAIL_DELETE = 'delete'

// STATE
export const STATE_LAYOUT_PAGE_TITLE = 'layout:pageTitle'
export const STATE_LAYOUT_PAGE_SUBTITLE = 'layout:pageSubtitle'
export const STATE_LAYOUT_PAGE_BREADCRUMB = 'layout:pageBreadCrumb'
export const STATE_USER_NAVIGATION = 'user:navigation'
export const STATE_USER_ACTIVE_TENANT_INDEX = 'user:activeTenantIndex'
export const STATE_CHECK_IN_EVENT_ID = 'checkIn:eventId'
export const STATE_EVENT_DETAIL_ACTIVE_TAB = 'eventDetail:activeTab'

// PAGINATION LIMIT
export const PAGINATION_LIMIT = [5, 10, 25, 50]

// FILENAME
export const FILE_IMPORT_PARTICIPANT = 'template/bulk_participant_template.xlsx'

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
export const CHECK_IN_METHOD_QR = 'check-in-qr'
export const CHECK_IN_METHOD_MANUAL = 'check-in-manual'
