import { SeverityLevel } from '@sentry/nextjs'
import { isString } from 'lodash-es'
import { z } from 'zod'

interface ZodDescribeMetadataWithException {
  triggerException: true
  message?: string
  severityLevel?: SeverityLevel
  [key: string]: unknown
}

interface ZodDescribeMetadataWithoutException {
  triggerException: false
  message?: string
  severityLevel?: never
  [key: string]: unknown
}

export type ZodDescribeMetadata =
  | ZodDescribeMetadataWithException
  | ZodDescribeMetadataWithoutException

interface SafeParseDescriptionWithMetadata {
  description: ZodDescribeMetadata
  additionalMetadata?: Record<string, unknown>
}

function safeParseDescription({
  description,
  additionalMetadata,
}: SafeParseDescriptionWithMetadata): string {
  try {
    return JSON.stringify(Object.assign({}, description, additionalMetadata))
  } catch (error) {
    return 'FAILED_TO_PARSE_DESCRIPTION'
  }
}

export function withEnhancedDescription<T>(
  schema: z.ZodType<T>,
  description: ZodDescribeMetadata,
  additionalMetadata?: Record<string, unknown>,
) {
  const parsedDescription = safeParseDescription({ description, additionalMetadata })

  return schema.describe(parsedDescription)
}

export function withSafeParseWithMetadata<T>(schema: z.ZodType<T>, data: T) {
  const result = schema.safeParse(data)

  if (result.success) {
    return result
  }

  const errorsMetadata: Partial<Record<keyof T, ZodDescribeMetadata>> = {} as Partial<
    Record<keyof T, ZodDescribeMetadata>
  >

  if (schema instanceof z.ZodObject) {
    const errorFields = result.error.flatten().fieldErrors

    for (const field of Object.keys(errorFields)) {
      try {
        const description = schema.shape[field as keyof typeof schema.shape]?.description
        const metadata =
          isString(description) && description.startsWith('{') && description.endsWith('}')
            ? JSON.parse(description)
            : null

        if (metadata) {
          errorsMetadata[field as keyof T] = metadata as ZodDescribeMetadata
        }
      } catch (error) {
        errorsMetadata[field as keyof T] = {
          triggerException: true,
          message: `Failed to parse description for field ${field}`,
        }
        continue
      }
    }
  }

  return { ...result, errorsMetadata }
}
