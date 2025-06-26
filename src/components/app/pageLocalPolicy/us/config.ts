import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'

const statesWithDC = {
  ...US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  DC: US_STATE_CODE_TO_DISPLAY_NAME_MAP.DC,
}

export const states = Object.fromEntries(
  Object.entries(statesWithDC).sort(([, a], [, b]) => a.localeCompare(b)),
) as typeof statesWithDC
