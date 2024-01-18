import { faker } from '@faker-js/faker'
import _ from 'lodash'
import 'server-only'

export type LeaderboardConfig = {
  offset: number
}

export interface LeaderboardEntity {
  usdDonationValue: number
  ownerAddress: string
  ownerEnsName?: string
}

const mockLeaderboard = async (config: LeaderboardConfig) => {
  return _.times(2).map(i => {
    const entity: LeaderboardEntity = {
      usdDonationValue: 3.14 * (1000 - config.offset - i),
      ownerAddress: faker.internet.ipv6(),
      ownerEnsName: `${faker.internet.domainWord()}.eth`,
    }
    return entity
  })
}

export async function getLeaderboard(config: LeaderboardConfig) {
  return mockLeaderboard(config)
}
