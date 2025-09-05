import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { caExternalUrls } from '@/utils/shared/urls'

export function CaSocialIcons() {
  return (
    <div className="flex justify-center gap-3">
      <PageUnsubscribeLayout.SocialButton
        alt="X logo"
        href={caExternalUrls.twitter()}
        iconSrc="/socialIcons/x.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="LinkedIn logo"
        href={caExternalUrls.linkedin()}
        iconSrc="/socialIcons/linkedin.svg"
      />
    </div>
  )
}
