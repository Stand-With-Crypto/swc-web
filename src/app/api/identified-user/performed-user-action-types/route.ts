import 'server-only'

import { uniq } from 'lodash-es'
import { NextResponse } from 'next/server'

import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'

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

  const performedUserActionTypes = uniq(
    user?.userActions.map(({ actionType, campaignName }) => ({ actionType, campaignName })),
  )
  return { performedUserActionTypes }
}

export type GetUserPerformedUserActionTypesResponse = Awaited<
  ReturnType<typeof apiResponseForUserPerformedUserActionTypes>
>

export async function GET() {
  const response = await apiResponseForUserPerformedUserActionTypes()
  return NextResponse.json(response)
}
