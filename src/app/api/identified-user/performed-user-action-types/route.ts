import 'server-only'

import { uniqBy } from 'lodash-es'
import { NextResponse } from 'next/server'

import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { withUserSession } from '@/utils/server/serverWrappers/withUserSession'

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

export const GET = withUserSession(async () => {
  const response = await apiResponseForUserPerformedUserActionTypes()
  return NextResponse.json(response)
})
