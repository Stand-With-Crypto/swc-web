import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'custom'
const LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as LogLevel
const LOG_LEVEL_IMPORTANCE_ORDER: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'custom']
let envLogLevelUsed: LogLevel[] | null = null
const wrappedLogger = (
  level: LogLevel,
  fn: (message?: any, ...optionalParams: any[]) => void,
  prefix?: string,
) => {
  return (message?: any, ...optionalParams: any[]) => {
    if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
      return
    }
    if (!envLogLevelUsed) {
      envLogLevelUsed = LOG_LEVEL_IMPORTANCE_ORDER.slice(
        LOG_LEVEL_IMPORTANCE_ORDER.findIndex(orderedLevel => orderedLevel === LOG_LEVEL),
      )
    }
    if (!envLogLevelUsed.includes(level)) {
      return
    }
    return fn(`${prefix || ''}${message}`, ...optionalParams)
  }
}
export const logger = {
  error: wrappedLogger('error', console.error, 'error - '),
  warn: wrappedLogger('warn', console.warn, 'warn - '),
  info: wrappedLogger('info', console.info, 'info - '),
  custom: wrappedLogger('custom', console.log),
  debug: wrappedLogger('debug', console.debug, 'debug - '),
}

export function getLogger(namespace: string) {
  return {
    error: wrappedLogger('error', console.error, `error - ${namespace} - `),
    warn: wrappedLogger('warn', console.warn, `warn - ${namespace} - `),
    info: wrappedLogger('info', console.info, `info - ${namespace} - `),
    custom: wrappedLogger('custom', console.log, `${namespace} - `),
    // http: wrappedLogger('http', console.http),
    // verbose: wrappedLogger('verbose', console.verbose),
    debug: wrappedLogger('debug', console.debug, `debug - ${namespace} - `),
    // silly: wrappedLogger('silly', console.silly),
  }
}
