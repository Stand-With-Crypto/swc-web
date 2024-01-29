import { Button } from '@/components/ui/button'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

export function PolicyCard({
  title,
  description,
  primaryCta,
  primaryCtaUrl,
  secondaryCta,
  secondaryCtaUrl,
}: {
  title: string
  description: string
  primaryCta: string
  primaryCtaUrl: string
  secondaryCta?: string
  secondaryCtaUrl?: string
}) {
  return (
    <div className="flex flex-col content-center items-center gap-4 rounded-3xl bg-slate-200  p-6  md:flex-row">
      <div className="flex w-full flex-row items-center justify-start gap-4 ">
        <div className="flex flex-col gap-2 text-left">
          <span className="text-xl font-bold">{title}</span>
          <span>{description}</span>
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button asChild>
          <TrackedExternalLink
            eventProperties={{
              component: AnalyticComponentType.button,
              action: AnalyticActionType.click,
              link: primaryCtaUrl,
              page: 'Resources',
              surface: 'Policy Card',
            }}
            href={primaryCtaUrl}
          >
            {primaryCta}
          </TrackedExternalLink>
        </Button>
        {secondaryCta && secondaryCtaUrl && (
          <Button variant="secondary" asChild>
            <TrackedExternalLink
              eventProperties={{
                component: AnalyticComponentType.button,
                action: AnalyticActionType.click,
                link: secondaryCtaUrl,
                page: 'Resources',
                surface: 'Policy Card',
              }}
              href={secondaryCtaUrl}
            >
              {secondaryCta}
            </TrackedExternalLink>
          </Button>
        )}
      </div>
    </div>
  )
}
