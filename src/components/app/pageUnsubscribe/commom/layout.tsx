import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageUnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mt-20 flex flex-col items-center gap-20">{children}</div>
}

PageUnsubscribeLayout.Logo = function Logo({ src }: { src: string }) {
  return (
    <section>
      <NextImage alt="Stand With Crypto Shield" height={80} priority src={src} width={80} />
    </section>
  )
}

PageUnsubscribeLayout.ContentSection = function ContentSection({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="space-y-8">{children}</section>
}

PageUnsubscribeLayout.Heading = function Heading() {
  return (
    <>
      <PageTitle size="md">Unsubscribed Successfully</PageTitle>
      <PageSubTitle className="max-w-2xl">
        We're sorry to see you go.
        <br />
        Please <span className="text-primary-cta">resubscribe</span> if you've changed your mind.
      </PageSubTitle>
    </>
  )
}

PageUnsubscribeLayout.SocialSection = function SocialSection({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="flex flex-col items-center gap-3 text-center">{children}</section>
}

interface SocialButtonProps {
  href: string
  iconSrc: string
  alt: string
}
PageUnsubscribeLayout.SocialButton = function SocialButton({
  href,
  iconSrc,
  alt,
}: SocialButtonProps) {
  return (
    <Button asChild size="icon" variant="secondary">
      <ExternalLink href={href}>
        <NextImage alt={alt} height={18} src={iconSrc} width={18} />
      </ExternalLink>
    </Button>
  )
}
