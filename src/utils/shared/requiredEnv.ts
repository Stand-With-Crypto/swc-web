export function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    // TODO add error tracking
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.warn(`Required environment variable ${name} is missing. Value was ${value}`)
  }
  return value!
}
