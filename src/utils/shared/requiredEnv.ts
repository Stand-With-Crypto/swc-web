export function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    // TODO add error tracking
    console.warn(`Required environment variable ${name} is missing`)
  }
  return value!
}
