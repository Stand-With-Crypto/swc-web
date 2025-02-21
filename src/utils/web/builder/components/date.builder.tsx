import { Builder } from '@builder.io/react'

import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import {
  DEFAULT_LOCALE,
  ORDERED_SUPPORTED_LOCALES,
  SupportedLocale,
} from '@/utils/shared/supportedLocales'
import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { BuilderInputTypeOptions } from '@/utils/web/builder/types'

interface DateProps extends BuilderComponentBaseProps {
  date: string
  dateStyle: Intl.DateTimeFormatOptions['dateStyle']
  timeStyle: Intl.DateTimeFormatOptions['timeStyle']
  day: Intl.DateTimeFormatOptions['day']
  month: Intl.DateTimeFormatOptions['month']
  year: Intl.DateTimeFormatOptions['year']
  hour: Intl.DateTimeFormatOptions['hour']
  minute: Intl.DateTimeFormatOptions['minute']
  second: Intl.DateTimeFormatOptions['second']
}

// The FormattedDatetime component is a wrapper around the Intl.DateTimeFormat API
// The component crashes if you pass a prop like day or month together with dateStyle or timeStyle
// So we need to handle the change of these props in the Builder.io editor
const handleStyleChange = (options: BuilderInputTypeOptions) => {
  options.set('day', '')
  options.set('month', '')
  options.set('year', '')
  options.set('hour', '')
  options.set('minute', '')
  options.set('second', '')
}

const handlePropChange = (options: BuilderInputTypeOptions) => {
  options.set('dateStyle', '')
  options.set('timeStyle', '')
}

Builder.registerComponent(
  (props: DateProps) => {
    let locale: SupportedLocale = DEFAULT_LOCALE

    if (
      props.builderState?.state.locale &&
      ORDERED_SUPPORTED_LOCALES.includes(props.builderState?.state.locale)
    ) {
      locale = props.builderState?.state.locale as SupportedLocale
    }

    const { dateStyle, timeStyle, day, month, year, hour, minute, second } = props

    // If you remove an enum prop in Builder.io editor, it will be set to an empty string
    // And we need to pass undefined to the Intl.DateTimeFormatOptions to ignore it
    const dateFormatProps = {
      dateStyle: dateStyle || undefined,
      timeStyle: timeStyle || undefined,
      day: day || undefined,
      month: month || undefined,
      year: year || undefined,
      hour: hour || undefined,
      minute: minute || undefined,
      second: second || undefined,
    }

    return <FormattedDatetime {...dateFormatProps} date={new Date(props.date)} locale={locale} />
  },
  {
    name: 'Date',
    noWrap: true,
    defaultStyles: {
      margin: '0',
    },
    inputs: [
      {
        name: 'date',
        type: 'date',
        defaultValue: new Date().toISOString(),
      },
      {
        name: 'dateStyle',
        type: 'enum',
        enum: ['full', 'long', 'medium', 'short'],
        defaultValue: 'full',
        onChange: handleStyleChange,
      },
      {
        name: 'timeStyle',
        type: 'enum',
        enum: ['full', 'long', 'medium', 'short'],
        defaultValue: 'full',
        onChange: handleStyleChange,
      },
      {
        name: 'day',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit'],
        onChange: handlePropChange,
      },
      {
        name: 'month',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit', 'long', 'short', 'narrow'],
        onChange: handlePropChange,
      },
      {
        name: 'year',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit'],
        onChange: handlePropChange,
      },
      {
        name: 'hour',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit'],
        onChange: handlePropChange,
      },
      {
        name: 'minute',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit'],
        onChange: handlePropChange,
      },
      {
        name: 'second',
        advanced: true,
        type: 'enum',
        enum: ['numeric', '2-digit'],
        onChange: handlePropChange,
      },
    ],
  },
)
