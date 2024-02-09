import { literal, string, union } from 'zod'

export const zodOptionalEmptyString = <T extends ReturnType<typeof string>>(val: T) =>
  union([val, literal('')])
