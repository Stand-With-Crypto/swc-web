import * as Sentry from '@sentry/nextjs'
import { isBrowser } from '@/utils/shared/executionEnvironment'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'custom'
const LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as LogLevel
const LOG_LEVEL_IMPORTANCE_ORDER: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'custom']

const consoleToSentryLevelMap: Record<LogLevel, Sentry.SeverityLevel> = {
  custom: 'log',
  debug: 'debug',
  error: 'error',
  info: 'info',
  warn: 'warning',
}

let envLogLevelUsed: LogLevel[] | null = null
const wrappedLogger = (
  level: LogLevel,
  fn: (message?: any, ...optionalParams: any[]) => void,
  prefix?: string,
) => {
  return (message?: any, ...optionalParams: any[]) => {
    if (NEXT_PUBLIC_ENVIRONMENT === 'production' && isBrowser) {
      Sentry.addBreadcrumb({
        category: prefix,
        data: { data: optionalParams },
        level: consoleToSentryLevelMap[level],
        message,
      })
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
    return fn(`${level} - ${prefix ? `${prefix} - ` : ''}${message}`, ...optionalParams)
  }
}

export const customLogger = (
  message: { originalMessage: string; formattedMessage: string; category: string },
  formatting: string[],
  ...optionalParams: any[]
) => {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production' && isBrowser) {
    Sentry.addBreadcrumb({
      category: message.category,
      data: { data: optionalParams },
      level: 'info',
      message: message.originalMessage,
    })
    return
  }
  if (!envLogLevelUsed) {
    envLogLevelUsed = LOG_LEVEL_IMPORTANCE_ORDER.slice(
      LOG_LEVEL_IMPORTANCE_ORDER.findIndex(orderedLevel => orderedLevel === LOG_LEVEL),
    )
  }
  return console.log(message.formattedMessage, ...formatting, ...optionalParams)
}
export const logger = {
  debug: wrappedLogger('debug', console.debug),
  error: wrappedLogger('error', console.error),
  info: wrappedLogger('info', console.info),
  warn: wrappedLogger('warn', console.warn),
}

export function getLogger(namespace: string) {
  return {
    debug: wrappedLogger('debug', console.debug, namespace),
    error: wrappedLogger('error', console.error, namespace),
    info: wrappedLogger('info', console.info, namespace),
    warn: wrappedLogger('warn', console.warn, namespace),
  }
}
