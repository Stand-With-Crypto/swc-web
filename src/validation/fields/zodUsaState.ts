import { enum as zodEnum } from 'zod'

import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

const [firstState, ...otherStates] = Object.keys(
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
) as (keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP)[]

export const zodUsaState = zodEnum([firstState, ...otherStates], {
  required_error: 'Please enter a valid US state',
})
