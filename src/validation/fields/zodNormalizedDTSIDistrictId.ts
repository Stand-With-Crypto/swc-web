import { z } from 'zod'

import { MAX_DISTRICT_COUNT } from '@/utils/shared/stateMappings/usStateDistrictUtils'

export const zodNormalizedDTSIDistrictId = z.union([
  z.literal('at-large'),
  z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().gte(1).lte(MAX_DISTRICT_COUNT)),
])
