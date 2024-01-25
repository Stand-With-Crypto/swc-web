import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'

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
    <div className="flex flex-col content-center items-center gap-4 rounded-3xl bg-[#F5F8FF]  p-6  md:flex-row">
      <div className="flex w-full flex-row items-center justify-start gap-4 ">
        <div className="flex flex-col gap-2 text-left">
          <span className="text-xl font-bold">{title}</span>
          <span>{description}</span>
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button asChild>
          <ExternalLink href={primaryCtaUrl}>{primaryCta}</ExternalLink>
        </Button>
        {secondaryCta && secondaryCtaUrl && (
          <Button variant="secondary" asChild>
            <ExternalLink href={secondaryCtaUrl}>{secondaryCta}</ExternalLink>
          </Button>
        )}
      </div>
    </div>
  )
}
