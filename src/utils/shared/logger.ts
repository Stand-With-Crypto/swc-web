import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const wrappedLogger = (fn: (message?: any, ...optionalParams: any[]) => void, prefix?: string) => {
  return (message?: any, ...optionalParams: any[]) => {
    if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
      return
    }
    return fn(`${prefix || ''}${message}`, ...optionalParams)
  }
}
export const logger = {
  error: wrappedLogger(console.error, 'error - '),
  warn: wrappedLogger(console.warn, 'warn - '),
  info: wrappedLogger(console.info, 'info - '),
  custom: wrappedLogger(console.log),
  debug: wrappedLogger(console.debug, 'debug - '),
}

export function getLogger(namespace: string) {
  return {
    error: wrappedLogger(console.error, `error - ${namespace} - `),
    warn: wrappedLogger(console.warn, `warn - ${namespace} - `),
    info: wrappedLogger(console.info, `info - ${namespace} - `),
    custom: wrappedLogger(console.log, `${namespace} - `),
    // http: wrappedLogger(console.http),
    // verbose: wrappedLogger(console.verbose),
    debug: wrappedLogger(console.debug, `debug - ${namespace} - `),
    // silly: wrappedLogger(console.silly),
  }
}
