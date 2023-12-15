import Link from 'next/link'
import { PageProps } from '@/types'
import { getIntlMessages } from '@/utils/server/intlMessages'
import { SUPPORTED_LOCALES } from '@/utils/shared/locales'
import { CTAJoinTheFight } from '@/components/app/ctaJoinTheFight'
import { getIntlUrls } from '@/utils/shared/urls'
import { Leaderboard } from '@/components/app/leaderboard'
import { getLeaderboard } from '@/data/leaderboard'
import { CTAEmailYourCongressperson } from '@/components/app/ctaEmailYourCongressperson/ctaEmailYourCongressperson'
import { NavbarSessionButton } from '@/components/app/navbarSessionButton'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function Home(props: PageProps) {
  const [messages, leaderboardEntities] = await Promise.all([
    getIntlMessages(props.params.lang),
    getLeaderboard({ offset: 0 }),
  ])

  return (
    // TODO remove prose class and actually start styling things!
    <main className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
      <h1>Sample Architecture Patterns</h1>
      <h2>Sample Auth</h2>
      <div>
        <NavbarSessionButton />
      </div>
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
      <h2>Sample modal</h2>
      <CTAJoinTheFight />
      <h2>Sample Leaderboard</h2>
      <p>
        This example shows how we can use server side data to bootstrap a dynamic component that can
        then leverage APIs as needed. The server side render will include the first 10 leaderboard,
        and then additional items can be appended client side as needed
      </p>
      <Leaderboard initialEntities={leaderboardEntities} />
      <h2>Sample complex form</h2>
      <CTAEmailYourCongressperson />
    </main>
  )
}
