import { Builder } from '@builder.io/react'

import { SectionModelIdentifiers } from '@/utils/server/builder/models/section/constants'
import { DEFAULT_LOCALE, SupportedLocale } from '@/utils/shared/supportedLocales'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

import { Footer } from '.'

Builder.registerComponent(
  (props: BuilderComponentBaseProps<{ locale: SupportedLocale }>) => {
    const { locale } = props.builderState?.state ?? {}

    return <Footer locale={locale ?? DEFAULT_LOCALE} />
  },
  {
    name: 'Footer',
    models: [SectionModelIdentifiers.FOOTER],
  },
)
