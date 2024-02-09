import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import _ from 'lodash'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'force-dynamic'

async function apiResponseForUserPerformedUserActionTypes() {
  const { user } = await getMaybeUserAndMethodOfMatch({
    include: {
      userActions: {
        select: { actionType: true, id: true },
      },
    },
  })

  const performedUserActionTypes = _.uniq(user?.userActions.map(({ actionType }) => actionType))
  return { performedUserActionTypes }
}

export type GetUserPerformedUserActionTypesResponse = Awaited<
  ReturnType<typeof apiResponseForUserPerformedUserActionTypes>
>

export async function GET() {
  const response = await apiResponseForUserPerformedUserActionTypes()
  return NextResponse.json(response)
}
