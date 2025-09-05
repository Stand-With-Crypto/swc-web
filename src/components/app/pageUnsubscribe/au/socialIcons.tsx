import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { auExternalUrls } from '@/utils/shared/urls'

export function AuSocialIcons() {
  return (
    <div className="flex justify-center gap-3">
      <PageUnsubscribeLayout.SocialButton
        alt="X logo"
        href={auExternalUrls.twitter()}
        iconSrc="/socialIcons/x.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="LinkedIn logo"
        href={auExternalUrls.linkedin()}
        iconSrc="/socialIcons/linkedin.svg"
      />
    </div>
  )
}
