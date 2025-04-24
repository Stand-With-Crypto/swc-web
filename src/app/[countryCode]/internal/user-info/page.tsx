'use client'

import { useState } from 'react'
import { useCookie } from 'react-use'
import { UserActionOptInType } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageTitle } from '@/components/ui/pageTitleText'
import { verifiedSWCPartnersUserActionOptIn } from '@/data/verifiedSWCPartners/userActionOptIn'
import { useSession } from '@/hooks/useSession'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export default function UserSettingsPage() {
  const [countryCode] = useCookie(USER_ACCESS_LOCATION_COOKIE_NAME)
  const parsedCountryCode = countryCode?.toLowerCase()
  const session = useSession()

  const [userBaseName, setUserBaseName] = useState('TestMAIN')

  const testPerformance = async () => {
    const timeStart = performance.now()
    const result = await verifiedSWCPartnersUserActionOptIn({
      emailAddress: `${userBaseName}@test.com`,
      optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      campaignName: userBaseName,
      isVerifiedEmailAddress: true,
      partner: VerifiedSWCPartner.COINBASE,
      countryCode: SupportedCountryCodes.US,
      phoneNumber: '+1234567890',
      firstName: userBaseName,
      lastName: userBaseName,
      address: {
        streetNumber: '123',
        route: 'Test',
        subpremise: 'Test',
        locality: 'Test',
        administrativeAreaLevel1: 'Test',
        administrativeAreaLevel2: 'Test',
        postalCode: '12345',
        postalCodeSuffix: 'Test',
        countryCode: SupportedCountryCodes.US,
      },
    })

    console.log(result)

    const timeEnd = performance.now()

    console.log(`Time taken: ${timeEnd - timeStart} milliseconds`)
  }

  return (
    <div className="container mx-auto max-w-lg space-y-4">
      <PageTitle size="lg">User info</PageTitle>

      <div>
        <Label>ID</Label>
        <Input readOnly value={session.user?.id ?? ''} />
      </div>
      <div>
        <Label>Country Code</Label>
        <Input readOnly value={parsedCountryCode ?? ''} />
      </div>
      <div>
        <Label>User Base Name</Label>
        <Input onChange={e => setUserBaseName(e.target.value)} value={userBaseName} />
      </div>
      <Button onClick={testPerformance}>Test Performance</Button>
    </div>
  )
}
