import { noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { EmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/common/sections/email'
import { useEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/common/useEmailActionCampaignMetadata'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { getYourPoliticianCategoryDisplayName } from '@/utils/shared/yourPoliticianCategory'
import { cn } from '@/utils/web/cn'

type UserActionFormEmailCongresspersonSkeletonProps =
  | {
      countryCode: SupportedCountryCodes.US
      campaignName: USUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.AU
      campaignName: AUUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.CA
      campaignName: CAUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.GB
      campaignName: GBUserActionEmailCampaignName
    }

export function UserActionFormEmailCongresspersonSkeleton(
  props: UserActionFormEmailCongresspersonSkeletonProps,
) {
  const { countryCode } = props
  const urls = getIntlUrls(countryCode)
  const campaignMetadata = useEmailActionCampaignMetadata(props)

  if (!campaignMetadata) {
    return null
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <form className="flex max-h-dvh flex-col">
          <LoadingOverlay />
          <ScrollArea className="overflow-auto">
            <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
              <EmailCongressperson.Heading
                subtitle={campaignMetadata.dialogSubtitle}
                title={campaignMetadata.dialogTitle}
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormItemSkeleton>
                    <label>Name</label>
                    <Input placeholder="Your name" />
                  </FormItemSkeleton>

                  <FormItemSkeleton>
                    <label>Email</label>
                    <Input placeholder="Your email" />
                  </FormItemSkeleton>
                  <FormItemSkeleton>
                    <label>Phone number</label>
                    <Input placeholder="Your phone number" />
                  </FormItemSkeleton>
                  <FormItemSkeleton>
                    <label>Address</label>
                    <Input placeholder="Your full address" />
                  </FormItemSkeleton>
                </div>
                <div className="w-full">
                  <DTSICongresspersonAssociatedWithFormAddress
                    categoryDisplayName={getYourPoliticianCategoryDisplayName({
                      countryCode,
                      category: campaignMetadata.politicianCategory,
                    })}
                    countryCode={countryCode}
                    dtsiPeopleFromAddressResponse={
                      {} as ReturnType<typeof useGetDTSIPeopleFromAddress>
                    }
                    onChangeAddress={noop}
                  />
                </div>
                <div className="relative">
                  <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-background/90">
                    <p className="text-bold max-w-md text-center">
                      Enter your address to generate a personalized message.
                    </p>
                  </div>
                  <FormItemSkeleton>
                    <Textarea
                      autoComplete="off"
                      autoCorrect="off"
                      defaultValue={campaignMetadata.getEmailBodyText()}
                      placeholder="Your message..."
                      rows={16}
                      spellCheck={false}
                    />
                  </FormItemSkeleton>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="py-6 md:px-12">
            <p className="text-xs text-fontcolor-muted">
              By submitting, I understand that Stand With Crypto and its vendors may collect and use
              my personal information subject to the{' '}
              <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink> and the{' '}
              <ExternalLink href={'https://www.quorum.us/privacy-policy/'}>
                Quorum Privacy Policy
              </ExternalLink>
              .
            </p>
          </div>

          <div
            className="z-10 flex flex-1 flex-col items-center justify-center gap-4 border border-t p-6 sm:flex-row md:px-12"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
          >
            <Button className="w-full sm:max-w-md" size="lg" type="submit">
              Send
            </Button>
          </div>
        </form>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
