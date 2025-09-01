import type {
  ConditionalContext,
  ConditionalOptions,
  InterpolationContext,
  PluralContext,
  PluralOptions,
  SupportedLanguage,
  TranslationValue,
} from './types'

function isPluralOptions(value: TranslationValue): value is PluralOptions {
  return typeof value === 'object' && value !== null && 'other' in value
}

function isConditionalOptions(value: TranslationValue): value is ConditionalOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('other' in value) &&
    !('zero' in value) &&
    !('one' in value)
  )
}

function isPluralContext(
  context: InterpolationContext,
): context is InterpolationContext & PluralContext {
  return typeof context === 'object' && context !== null && 'count' in context
}

function isConditionalContext(
  context: InterpolationContext,
): context is InterpolationContext & ConditionalContext {
  return typeof context === 'object' && context !== null && 'condition' in context
}

function resolvePlural(
  options: PluralOptions,
  count: number,
  language: SupportedLanguage = 'en',
): string {
  // Use Intl.PluralRules to determine the correct plural form
  const pluralRules = new Intl.PluralRules(language)
  const rule = pluralRules.select(count)

  // Map Intl rules to our options
  switch (rule) {
    case 'zero':
      return options.zero || options.other
    case 'one':
      return options.one || options.other
    case 'two':
      return (options as any).two || options.other
    case 'few':
      return (options as any).few || options.other
    case 'many':
      return (options as any).many || options.other
    case 'other':
    default:
      return options.other
  }
}

function resolveConditional(options: ConditionalOptions, condition: string): string {
  return options[condition] || options.default || Object.values(options)[0] || ''
}

function formatValue(
  value: any,
  format: string,
  language: SupportedLanguage = 'en',
  options: Record<string, any> = {},
): string {
  if (value === undefined || value === null) {
    return ''
  }

  switch (format) {
    case 'number':
      return typeof value === 'number'
        ? new Intl.NumberFormat(language, options).format(value)
        : String(value)

    case 'currency':
      return typeof value === 'number'
        ? new Intl.NumberFormat(language, {
            style: 'currency',
            currency: options.currency || 'USD',
            ...options,
          }).format(value)
        : String(value)

    case 'percent':
      return typeof value === 'number'
        ? new Intl.NumberFormat(language, { style: 'percent', ...options }).format(value)
        : String(value)

    case 'date': {
      const dateValue = value instanceof Date ? value : new Date(value)
      return new Intl.DateTimeFormat(language, options).format(dateValue)
    }

    case 'time': {
      const timeValue = value instanceof Date ? value : new Date(value)
      return new Intl.DateTimeFormat(language, {
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      }).format(timeValue)
    }
    case 'relative': {
      const relativeValue = value instanceof Date ? value : new Date(value)
      const rtf = new Intl.RelativeTimeFormat(language, options)
      const diffInSeconds = (relativeValue.getTime() - Date.now()) / 1000

      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(Math.round(diffInSeconds), 'second')
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.round(diffInSeconds / 60), 'minute')
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.round(diffInSeconds / 3600), 'hour')
      } else {
        return rtf.format(Math.round(diffInSeconds / 86400), 'day')
      }
    }

    case 'uppercase':
      return String(value).toUpperCase()

    case 'lowercase':
      return String(value).toLowerCase()

    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()

    case 'title':
      return String(value).replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
      )

    default:
      return String(value)
  }
}

/**
 * Interpolates variables in a string using {variableName} with advanced support
 * Syntax: {key}, {key:format}, {key:format:option1=value1,option2=value2}
 */
function interpolateString(
  template: string,
  values: Record<string, any>,
  language: SupportedLanguage = 'en',
): string {
  return template.replace(/\{([^}]+)\}/g, (match, content) => {
    const parts = content.split(':')
    const variableName = parts[0].trim()
    const format = parts[1]?.trim()
    const optionsString = parts.slice(2).join(':')

    const value = values[variableName]

    if (value === undefined || value === null) {
      console.warn(`Missing interpolation value for key: ${variableName}`)
      return match
    }

    const options: Record<string, any> = {}
    if (optionsString) {
      optionsString.split(',').forEach((option: string) => {
        const [key, val] = option.split('=')
        if (key && val) {
          options[key.trim()] = val.trim()
        }
      })
    }

    // Apply formatting if specified
    if (format) {
      return formatValue(value, format, language, options)
    }

    return String(value)
  })
}

export function interpolate(
  value: TranslationValue,
  context: InterpolationContext = {},
  language: SupportedLanguage = 'en',
): string {
  if (typeof value === 'string') {
    return interpolateString(value, context, language)
  }

  if (isPluralOptions(value)) {
    if (!isPluralContext(context)) {
      console.warn('Plural translation requires count in context')
      return interpolateString(value.other, context, language)
    }
    const resolvedString = resolvePlural(value, context.count, language)
    return interpolateString(resolvedString, context, language)
  }

  if (isConditionalOptions(value)) {
    if (!isConditionalContext(context)) {
      console.warn('Conditional translation requires condition in context')
      return interpolateString(Object.values(value)[0] || '', context, language)
    }
    const resolvedString = resolveConditional(value, context.condition)
    return interpolateString(resolvedString, context, language)
  }

  return String(value)
}

export function createPluralContext(
  count: number,
  additionalValues: Record<string, any> = {},
): PluralContext & Record<string, any> {
  return { count, ...additionalValues }
}

export function createConditionalContext(
  condition: string,
  additionalValues: Record<string, any> = {},
): ConditionalContext & Record<string, any> {
  return { condition, ...additionalValues }
}
