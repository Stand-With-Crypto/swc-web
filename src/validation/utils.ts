import { literal, string, union, z } from 'zod'

export const zodOptionalEmptyString = <T extends ReturnType<typeof string>>(val: T) =>
  union([val, literal('')])

/**
 * @param zodSchema - The Zod schema to get the metadata from
 * @param validatedFields - The validated fields to get the errors from
 * @returns The metadata of the errors
 * @example
 * const zodSchema = z.object({
 *   name: z.string().describe(JSON.stringify({ serverOnly: true, level: 'error' })),
 * })
 * const validatedFields = zodSchema.safeParse({ name: 'John' })
 * const errorsMetadata = getValidationErrorsMetadata(zodSchema, validatedFields)
 * console.log(errorsMetadata)
 * // [{ field: 'name', data: { serverOnly: true, level: 'error' } }]
 */
export function getValidationErrorsMetadata(
  zodSchema: z.ZodType<any>,
  validatedFields: z.SafeParseError<any>,
) {
  const errorFields = validatedFields.error.flatten().fieldErrors

  return Object.keys(errorFields)
    .map(field => {
      try {
        const metadataDescription =
          zodSchema instanceof z.ZodObject
            ? zodSchema.shape[field as keyof typeof zodSchema.shape].description
            : undefined
        const parsedMetadataDescription =
          typeof metadataDescription === 'string' &&
          metadataDescription.startsWith('{') &&
          metadataDescription.endsWith('}')
            ? JSON.parse(metadataDescription)
            : undefined

        if (!metadataDescription) {
          return null
        }

        return {
          field,
          data: parsedMetadataDescription,
        }
      } catch (error) {
        return null
      }
    })
    .filter(Boolean)
}
