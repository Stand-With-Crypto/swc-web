import { EuParseLanguageClient } from '@/components/app/euParseLanguage/euParseLanguageClient'
import { EUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/eu'
import { PageProps } from '@/types'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const dynamic = 'error'

export default async function ParseLanguagePage(
  props: PageProps<{ language: SupportedLanguages }>,
) {
  const { language } = await props.params

  return (
    <EUHomepageDialogDeeplinkLayout hidePseudoDialog language={language}>
      <EuParseLanguageClient />
    </EUHomepageDialogDeeplinkLayout>
  )
}
