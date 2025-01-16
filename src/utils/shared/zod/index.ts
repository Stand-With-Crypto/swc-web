import { SeverityLevel } from '@sentry/nextjs'
import { isObject, isString } from 'lodash-es'
import { z } from 'zod'

z.ZodType.prototype.safeParseWithMetadata = function <T>(
  this: z.ZodType<T>,
  data: T,
):
  | { success: true; data: T }
  | { success: false; error: z.ZodError; errorsMetadata: Partial<Record<keyof T, unknown>> } {
  const result = this.safeParse(data)

  if (result.success) {
    return result
  }

  const errorsMetadata: Partial<Record<keyof T, unknown>> = {} as Partial<Record<keyof T, unknown>>

  if (this instanceof z.ZodObject) {
    const errorFields = result.error.flatten().fieldErrors

    for (const field of Object.keys(errorFields)) {
      try {
        const description = this.shape[field as keyof typeof this.shape]?.description
        const metadata =
          isString(description) && description.startsWith('{') && description.endsWith('}')
            ? JSON.parse(description)
            : null

        if (metadata) {
          errorsMetadata[field as keyof T] = metadata
        }
      } catch {
        continue
      }
    }
  }

  return { success: false, error: result.error, errorsMetadata }
}

z.ZodType.prototype.enhancedDescribe = function (description, additionalMetadata) {
  try {
    const isDescriptionObject = isObject(description)

    const parsedDescription = isDescriptionObject
      ? JSON.stringify(Object.assign({}, description, additionalMetadata))
      : description

    const describedSchema = this.describe(parsedDescription)

    return describedSchema
  } catch (error) {
    return this
  }
}

declare module 'zod' {
  interface ZodType {
    enhancedDescribe(description: string, additionalMetadata: never): this
    enhancedDescribe(
      description: {
        triggerException: false
        severityLevel?: SeverityLevel
        message?: string
      },
      additionalMetadata?: Record<string, unknown>,
    ): this

    safeParseWithMetadata<T>(
      data: T,
      params?: Partial<z.ParseParams>,
    ): z.SafeParseReturnType<T, T> & { errorsMetadata?: Partial<Record<keyof T, unknown>> }
  }
}

export { z }
