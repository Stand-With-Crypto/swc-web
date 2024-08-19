import 'server-only'

import { uniqBy } from 'lodash-es'
import { NextResponse } from 'next/server'

import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'

export const dynamic = 'force-dynamic'

async function apiResponseForUserPerformedUserActionTypes() {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
    prisma: {
      include: {
        userActions: {
          select: { id: true, actionType: true, campaignName: true },
        },
      },
    },
  })

  const performedUserActionTypes = uniqBy(
    user?.userActions.map(({ actionType, campaignName }) => ({ actionType, campaignName })),
    ({ actionType, campaignName }) => `${actionType}-${campaignName}`,
  )
  return { performedUserActionTypes }
}

export type GetUserPerformedUserActionTypesResponse = Awaited<
  ReturnType<typeof apiResponseForUserPerformedUserActionTypes>
>

export const GET = withRouteMiddleware(async () => {
  const response = await apiResponseForUserPerformedUserActionTypes()
  return NextResponse.json(response)
})
