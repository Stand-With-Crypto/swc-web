export type ValidationFunction<T extends (...args: any) => any> = (
  args: Parameters<T>,
) => Promise<{ errors: Record<string, string[]> } | undefined> | undefined

export function withValidations<T extends (...args: any) => any>(
  validations: ValidationFunction<T>[],
  action: T,
) {
  return async (
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T> | ReturnType<ValidationFunction<T>>>> => {
    for (const validation of validations) {
      const result = await validation(args)
      if (result) return result
    }

    return action(...args)
  }
}
