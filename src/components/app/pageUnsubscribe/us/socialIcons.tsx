import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { usExternalUrls } from '@/utils/shared/urls'

export function UsSocialIcons() {
  return (
    <div className="flex justify-center gap-3">
      <PageUnsubscribeLayout.SocialButton
        alt="X logo"
        href={usExternalUrls.twitter()}
        iconSrc="/socialIcons/x.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="Instagram logo"
        href={usExternalUrls.instagram()}
        iconSrc="/socialIcons/instagram.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="LinkedIn logo"
        href={usExternalUrls.linkedin()}
        iconSrc="/socialIcons/linkedin.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="Facebook logo"
        href={usExternalUrls.facebook()}
        iconSrc="/socialIcons/facebook.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="YouTube logo"
        href={usExternalUrls.youtube()}
        iconSrc="/socialIcons/youtube.svg"
      />
      <PageUnsubscribeLayout.SocialButton
        alt="Discord logo"
        href={usExternalUrls.discord()}
        iconSrc="/socialIcons/discord.svg"
      />
    </div>
  )
}
