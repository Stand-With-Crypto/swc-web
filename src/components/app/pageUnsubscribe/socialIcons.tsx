import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { usExternalUrls } from '@/utils/shared/urls'

export const SocialIcons = () => {
  return (
    <div className="flex justify-center gap-2">
      <Button asChild size="icon" variant="secondary">
        <ExternalLink href={usExternalUrls.twitter()}>
          <NextImage alt="X logo" height={18} src="/socialIcons/x.svg" width={18} />
        </ExternalLink>
      </Button>

      <Button asChild size="icon" variant="secondary">
        <ExternalLink href={usExternalUrls.instagram()}>
          <NextImage alt="Instagram logo" height={18} src="/socialIcons/instagram.svg" width={18} />
        </ExternalLink>
      </Button>

      <Button asChild size="icon" variant="secondary">
        <ExternalLink href={usExternalUrls.facebook()}>
          <NextImage alt="Facebook logo" height={18} src="/socialIcons/facebook.svg" width={18} />
        </ExternalLink>
      </Button>
    </div>
  )
}
