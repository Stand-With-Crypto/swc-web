import Link from 'next/link'
import { PageProps } from '../../types'
import { getIntlMessages } from '../../utils/server/intlMessages'
import { SUPPORTED_LOCALES } from '@/utils/shared/locales'
import { CTAJoinTheFight } from './ctaJoinTheFight'
import { getIntlUrls } from '../../utils/shared/urls'

// TODO metadata

export default async function Home(props: PageProps) {
  const messages = await getIntlMessages(props.params.lang)
  const urls = getIntlUrls(props.params.lang)
  return (
    // TODO remove prose class and actually start styling things!
    <main className="prose-sm mx-auto mt-10 w-full max-w-xl">
      <h1>Sample Architecture Patterns</h1>
      <h2>Sample Intl Messages</h2>
      <p>
        {messages.hello} - {messages.world}
      </p>
      <div>
        <p>Navigate to a different language</p>
        <div className="space-x-4">
          {SUPPORTED_LOCALES.map(locale => (
            <Link href={getIntlUrls(locale).home()} key={locale}>
              {locale}
            </Link>
          ))}
        </div>
      </div>
      <h2>Sample of loading a modal</h2>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#modals">
          based of next.js docs
        </a>
      </p>
      <CTAJoinTheFight />
    </main>
  )
}
