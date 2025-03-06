import { z } from 'zod'

export const validatePageNum = ([page]: (string | undefined)[]) => {
  const pageValidator = z.string().pipe(z.coerce.number().int().gte(1).lte(50))
  if (!page) {
    return 1
  }
  const val = pageValidator.safeParse(page)
  if (val.success) {
    return val.data
  }
  return null
}
