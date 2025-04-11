/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="mx-auto max-w-md">
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        disablePreventMobileKeyboardOffset
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}
interface UserAddressVoterGuideInput {
  countryCode: SupportedCountryCodes
}

export function UserAddressVoterGuideInputSection(props: UserAddressVoterGuideInput) {
  return (
    <Suspense
      fallback={
        <ContentContainer shouldShowSubtitle={true}>
          <DefaultPlacesSelect onChange={noop} value={null} />
        </ContentContainer>
      }
    >
      <SuspenseUserAddressVoterGuideInputSection {...props} />
    </Suspense>
  )
}

const POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate-and-house'

function SuspenseUserAddressVoterGuideInputSection({ countryCode }: UserAddressVoterGuideInput) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDTSIPeopleFromAddress(
    POLITICIAN_CATEGORY,
    address === 'loading' ? null : address?.description,
  )
  const shouldShowSubtitle = !address || !res.data

  if (!address || address === 'loading' || !res.data) {
    return (
      <ContentContainer shouldShowSubtitle={shouldShowSubtitle}>
        <DefaultPlacesSelect
          loading={address === 'loading' || res.isLoading}
          onChange={setAddress}
          value={address === 'loading' ? null : address}
        />
      </ContentContainer>
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <ContentContainer shouldShowSubtitle={shouldShowSubtitle}>
        <PageSubTitle as="h4" size="sm">
          {formatGetDTSIPeopleFromAddressNotFoundReason(res.data)}{' '}
          <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
            Try another address.
          </button>
        </PageSubTitle>
      </ContentContainer>
    )
  }
  const stateCode = res.data.dtsiPeople.find(x => x.primaryRole?.primaryState)?.primaryRole
    ?.primaryState as USStateCode | undefined

  const urls = getIntlUrls(countryCode)
  return (
    <ContentContainer shouldShowSubtitle={shouldShowSubtitle}>
      <div>
        <p className="mb-3 text-center text-sm text-fontcolor-muted">
          {stateCode ? 'Showing voter guide for' : 'No voter guide info related to'}{' '}
          <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
            {address.description}
          </button>
        </p>

        {stateCode && (
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl bg-muted p-6 sm:flex-row">
            <div>
              <h4 className="text-xl font-bold">Your crypto voter guide</h4>
              <p className="mt-4 text-fontcolor-muted">
                It looks like you’re in {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}. Take a look
                at our crypto voter guide for more key info on the role your state plays in crypto
                regulation.
              </p>
            </div>
            <div className="max-sm:w-full">
              <Button asChild className="w-full">
                <InternalLink href={urls.locationStateSpecific(stateCode)}>
                  {stateCode} voter guide
                </InternalLink>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  )
}

function ContentContainer({
  children,
  shouldShowSubtitle,
}: React.PropsWithChildren<{ shouldShowSubtitle: boolean }>) {
  return (
    <ContentSection
      className="container"
      subtitle={shouldShowSubtitle ? 'Enter your address to find key races near you.' : null}
      title="Races in your area"
    >
      {children}
    </ContentSection>
  )
}
