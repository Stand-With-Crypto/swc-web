import 'server-only'

import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'
import { NextResponse } from 'next/server'

import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const dynamic = 'force-dynamic'

async function apiResponseForUserPerformedUserActionTypes({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
    prisma: {
      include: {
        userActions: {
          select: { id: true, actionType: true, campaignName: true, countryCode: true },
        },
      },
    },
  })

  const performedUserActionTypes = uniqBy(
    user?.userActions
      .filter(
        action => action.actionType === UserActionType.OPT_IN || action.countryCode === countryCode,
      )
      .map(({ actionType, campaignName }) => ({ actionType, campaignName })),
    ({ actionType, campaignName }) => `${actionType}-${campaignName}`,
  )
  return { performedUserActionTypes }
}

export type GetUserPerformedUserActionTypesResponse = Awaited<
  ReturnType<typeof apiResponseForUserPerformedUserActionTypes>
>

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export const GET = withRouteMiddleware(async (_: Request, { params }: RequestContext) => {
  const { countryCode } = await params

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)
  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }
  const validatedCountryCode = validatedFields.data

  const response = await apiResponseForUserPerformedUserActionTypes({
    countryCode: validatedCountryCode,
  })
  return NextResponse.json(response)
})
