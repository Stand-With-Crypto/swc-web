import { Card } from '@/components/ui/card'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface ResultsOverviewCardProps {
  title: string
  proCryptoCandidatesElected: number
  antiCryptoCandidatesElected: number
  locale: SupportedLocale
  className?: string
}

export function ResultsOverviewCard(props: ResultsOverviewCardProps) {
  const { title, proCryptoCandidatesElected, antiCryptoCandidatesElected, locale, className } =
    props

  const proCryptoCandidateText = proCryptoCandidatesElected === 1 ? 'candidate' : 'candidates'
  const antiCryptoCandidateText = antiCryptoCandidatesElected === 1 ? 'candidate' : 'candidates'

  return (
    <LinkBox className={cn('flex max-w-xl flex-1')}>
      <Card className={cn('p-8', className)}>
        <InternalLink
          className={cn(linkBoxLinkClassName, 'text-lg font-bold')}
          data-link-box-subject
          href={getIntlUrls(locale).locationLiveResultsOverview()}
        >
          {title}
        </InternalLink>
        <div className="flex flex-col items-center justify-center gap-4 text-primary-foreground md:flex-row ">
          <div className="max-w-60 space-y-1 rounded-xl bg-green-700 p-4">
            <p className="text-3xl font-bold">{proCryptoCandidatesElected}</p>
            <p>Pro-crypto {proCryptoCandidateText} elected</p>
          </div>
          <div className="max-w-60 space-y-1 rounded-xl bg-red-700 p-4">
            <p className="text-3xl font-bold">{antiCryptoCandidatesElected}</p>
            <p>Anti-crypto {antiCryptoCandidateText} elected</p>
          </div>
        </div>
      </Card>
    </LinkBox>
  )
}
