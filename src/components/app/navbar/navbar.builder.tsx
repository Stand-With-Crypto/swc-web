import { Builder } from '@builder.io/react'

import { DEFAULT_LOCALE, ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { SectionModelIdentifiers } from '@/utils/server/builder/models/section/uniqueIdentifiers'
import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

import { Navbar } from '.'

Builder.registerComponent(
  (props: BuilderComponentBaseProps<{ locale: string }>) => {
    const { locale } = props.builderState?.state ?? {}

    return (
      <Navbar
        locale={
          locale && ORDERED_SUPPORTED_LOCALES.includes(locale)
            ? (locale as SupportedLocale)
            : DEFAULT_LOCALE
        }
      />
    )
  },
  {
    name: 'Navbar',
    models: [SectionModelIdentifiers.NAVBAR],
  },
)
