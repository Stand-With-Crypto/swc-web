import { literal, union, z } from 'zod'

import { YOUR_POLITICIAN_CATEGORY_OPTIONS as AU_OPTIONS } from '@/utils/shared/yourPoliticianCategory/au'
import { YOUR_POLITICIAN_CATEGORY_OPTIONS as CA_OPTIONS } from '@/utils/shared/yourPoliticianCategory/ca'
import { YOUR_POLITICIAN_CATEGORY_OPTIONS as GB_OPTIONS } from '@/utils/shared/yourPoliticianCategory/gb'
import { YOUR_POLITICIAN_CATEGORY_OPTIONS as US_OPTIONS } from '@/utils/shared/yourPoliticianCategory/us'

const [first, second, ...rest] = [
  ...new Set([...AU_OPTIONS, ...CA_OPTIONS, ...GB_OPTIONS, ...US_OPTIONS]),
].map(item => literal(item))

export const zodYourPoliticianCategory = union([first, second, ...rest])

export type YourPoliticianCategory = z.infer<typeof zodYourPoliticianCategory>
