import { string, union, literal } from 'zod'

export const zodOptionalEmptyString = <T extends ReturnType<typeof string>>(val: T) =>
  union([val, literal('')])
