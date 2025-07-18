import { Address, User } from '@prisma/client'
import { uniq } from 'lodash-es'

import {
  getMemberKey,
  getMultipleDistrictRankings,
  MemberKey,
} from '@/utils/server/districtRankings/upsertRankings'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodUSStateDistrict } from '@/validation/fields/zodAddress'

export async function getSMSVariablesByPhoneNumbers(phoneNumbers: string[]) {
  const users = await prismaClient.user.findMany({
    where: {
      phoneNumber: {
        in: phoneNumbers,
      },
    },
    orderBy: {
      // Use asc here so we take the latest created user when reducing
      datetimeCreated: 'asc',
    },
    include: {
      address: true,
      userSessions: {
        orderBy: {
          datetimeUpdated: 'desc',
        },
        take: 1,
      },
    },
  })

  const districtRankMap = await getDistrictRankMap(users)

  return users.reduce(
    (acc, user) => {
      if (!user?.phoneNumber) return acc

      const getDistrictRank = () => {
        const stateCode = user.address?.administrativeAreaLevel1
        const districtNumber = user.address?.electoralZone

        const parseResult = zodUSStateDistrict.safeParse({
          state: stateCode,
          district: districtNumber,
        })

        if (!parseResult.success) {
          return undefined
        }

        return districtRankMap[getMemberKey(parseResult.data)] || undefined
      }

      return {
        ...acc,
        [user.phoneNumber]: {
          userId: user.id,
          referralId: user.referralId,
          firstName: user.firstName,
          lastName: user.lastName,
          sessionId: user.userSessions?.[0]?.id,
          address: {
            district: {
              name: user.address?.electoralZone ?? undefined,
              rank: getDistrictRank(),
            },
            state: {
              name: user.address?.administrativeAreaLevel1
                ? getUSStateNameFromStateCode(user.address?.administrativeAreaLevel1)
                : undefined,
              code: user.address?.administrativeAreaLevel1 ?? undefined,
            },
          },
        },
      }
    },
    {} as Record<string, UserSMSVariables>,
  )
}

async function getDistrictRankMap(users: Array<User & { address: Address | null }>) {
  const uniqueUserDistricts = uniq(
    users
      .map(user => {
        const stateCode = user.address?.administrativeAreaLevel1
        const districtNumber = user.address?.electoralZone

        const parseResult = zodUSStateDistrict.safeParse({
          state: stateCode,
          district: districtNumber,
        })

        if (!parseResult.success) {
          return
        }

        return getMemberKey({
          state: parseResult.data.state,
          district: parseResult.data.district,
        })
      })
      .filter(Boolean),
  )

  const districtRankings = await getMultipleDistrictRankings({
    countryCode: SupportedCountryCodes.US,
    members: uniqueUserDistricts,
  })

  return districtRankings.reduce(
    (acc, { member, rank }) => {
      if (!rank) return acc

      return {
        ...acc,
        [member]: rank,
      }
    },
    {} as Record<MemberKey, number | null>,
  )
}
