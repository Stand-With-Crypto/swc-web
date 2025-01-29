// See https://www.twilio.com/docs/api/errors/{code} for more information on the error codes

// We should retry to send messages to these phone numbers
export const TOO_MANY_REQUESTS_CODE = '20429'

// We're flagging these phone numbers as invalid
export const INVALID_PHONE_NUMBER_CODE = '21211'
export const INFORMATION_SERVICE_NUMBER_CODE = '21268'
export const NOT_A_VALID_PHONE_NUMBER_CODE = '21614'

// We should opt out these phone numbers
export const IS_UNSUBSCRIBED_USER_CODE = '21610'
export const MESSAGE_BLOCKED_CODE = '30004'

// These errors are related to the user's mobile carrier not being available when we send messages
export const UNREACHABLE_DESTINATION_HANDSET_CODE = '30003'
export const UNKNOWN_DESTINATION_HANDSET_CODE = '30005'
export const LANDLINE_OR_UNREACHABLE_CARRIER_CODE = '30006'

// We received a machine generated response
export const FILTERED_TO_PREVENT_MESSAGE_LOOPS_CODE = '30039'
