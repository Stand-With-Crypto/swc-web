import { literal, union } from 'zod'

import { YOUR_POLITICIAN_CATEGORY_OPTIONS } from '@/utils/shared/yourPoliticianCategory'

const [first, second, ...rest] = YOUR_POLITICIAN_CATEGORY_OPTIONS.map(item => literal(item))

export const zodYourPoliticianCategory = union([first, second, ...rest])
