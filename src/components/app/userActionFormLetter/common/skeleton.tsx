import { noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { getAULetterActionCampaignMetadata } from '@/components/app/userActionFormLetter/au/campaigns'
import { Letter } from '@/components/app/userActionFormLetter/common/sections/letter'
import { LetterActionCampaignNames } from '@/components/app/userActionFormLetter/common/types'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { getYourPoliticianCategoryDisplayName } from '@/utils/shared/yourPoliticianCategory'
import { cn } from '@/utils/web/cn'

interface UserActionFormLetterSkeletonProps {
  countryCode: SupportedCountryCodes
  campaignName: LetterActionCampaignNames
}

export function UserActionFormLetterSkeleton(props: UserActionFormLetterSkeletonProps) {
  const { countryCode } = props
  const urls = getIntlUrls(countryCode)
  const campaignMetadata = getAULetterActionCampaignMetadata(props.campaignName)

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
              <Letter.Heading
                subtitle={campaignMetadata.dialogSubtitle}
                title={campaignMetadata.dialogTitle}
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormItemSkeleton>
                    <label>First name</label>
                    <Input placeholder="Your first name" />
                  </FormItemSkeleton>

                  <FormItemSkeleton>
                    <label>Last name</label>
                    <Input placeholder="Your last name" />
                  </FormItemSkeleton>
                  <FormItemSkeleton>
                    <label>Email</label>
                    <Input placeholder="Your email" />
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
                      Enter your address to generate a personalized letter.
                    </p>
                  </div>
                  <FormItemSkeleton>
                    <label>Letter preview</label>
                    <Textarea
                      autoComplete="off"
                      autoCorrect="off"
                      defaultValue={campaignMetadata.getLetterBodyText()}
                      disabled
                      placeholder=""
                      rows={16}
                      spellCheck={false}
                    />
                  </FormItemSkeleton>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div
            className="z-10 mt-auto flex w-full flex-col items-center justify-center gap-4 border border-t p-6 md:px-12"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
          >
            <p className="text-center text-xs text-fontcolor-muted sm:max-w-md">
              By submitting, I understand that Stand With Crypto and its vendors may collect and use
              my personal information subject to the{' '}
              <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink>.
            </p>
            <Button className="w-full sm:max-w-md" size="lg" type="submit">
              Send letter
            </Button>
          </div>
        </form>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
