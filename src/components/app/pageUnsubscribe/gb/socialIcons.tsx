import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { gbExternalUrls } from '@/utils/shared/urls'

export function GbSocialIcons() {
  return (
    <div className="flex justify-center gap-3">
      <PageUnsubscribeLayout.SocialButton
        alt="X logo"
        href={gbExternalUrls.twitter()}
        iconSrc="/socialIcons/x.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="Instagram logo"
        href={gbExternalUrls.linkedin()}
        iconSrc="/socialIcons/linkedin.svg"
      />
    </div>
  )
}
