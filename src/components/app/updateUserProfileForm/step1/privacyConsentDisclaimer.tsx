import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { FormDescription } from '@/components/ui/form'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function PrivacyConsentDisclaimer({
  shouldShowConsentDisclaimer,
}: {
  shouldShowConsentDisclaimer: boolean
}) {
  const intlUrls = useIntlUrls()

  return (
    <Collapsible open={shouldShowConsentDisclaimer}>
      <CollapsibleContent className="AnimateCollapsibleContent">
        <FormDescription className="text-center md:text-left">
          By completing your profile, you consent to and understand that SWC and its vendors may
          collect and use your personal information subject to{' '}
          <InternalLink href={intlUrls.privacyPolicy()}>SWC Privacy Policy</InternalLink>.
        </FormDescription>
      </CollapsibleContent>
    </Collapsible>
  )
}
