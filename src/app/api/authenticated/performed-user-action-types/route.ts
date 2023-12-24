import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { ThirdwebAuthUser } from '@thirdweb-dev/auth/next'
import _ from 'lodash'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function getPerformedUserActionTypes(authUser: ThirdwebAuthUser) {
  const userActions = await prismaClient.userAction.findMany({
    where: { user: { userCryptoAddress: { address: authUser.address } } },
    select: { id: true, actionType: true },
  })

  const performedUserActionTypes = _.uniq(userActions.map(({ actionType }) => actionType))
  return { performedUserActionTypes }
}

export async function GET() {
  const authUser = await appRouterGetAuthUser()

  if (!authUser) {
    return NextResponse.json({ authenticated: false })
  }

  const response = await getPerformedUserActionTypes(authUser)
  return NextResponse.json(response)
}
