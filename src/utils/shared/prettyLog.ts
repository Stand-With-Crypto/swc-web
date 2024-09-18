import { safeStringify } from '@/utils/web/safeStringify'

export const prettyStringify = (obj: any) => safeStringify(obj, null, 4)

export const prettyLog = (obj: any) => console.log(prettyStringify(obj))
