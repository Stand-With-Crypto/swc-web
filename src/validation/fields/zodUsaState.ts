import { enum as zodEnum } from 'zod'

import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'

const [firstState, ...otherStates] = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP) as USStateCode[]

export const zodUsaState = zodEnum([firstState, ...otherStates], {
  required_error: 'Please enter a valid US state',
})
