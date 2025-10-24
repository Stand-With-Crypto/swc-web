import {
  fetchQuorumByPersonId,
  type NormalizedQuorumAddress,
} from '@/utils/server/quorum/utils/fetchQuorum'
import { redis } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('getQuorumPoliticianAddress')

const QUORUM_POLITICIAN_ADDRESS_CACHE_KEY = 'quorum:politician:address'
const REDIS_CACHE_TTL_SECONDS = 6 * 60 * 60 // 6 hours

interface NormalizedQuorumPoliticianAddress {
  address: string | null
  officeAddress: NormalizedQuorumAddress | null
}

export async function getQuorumPoliticianAddress(
  quorumPersonId: string,
): Promise<NormalizedQuorumPoliticianAddress | undefined> {
  const redisCacheKey = `${QUORUM_POLITICIAN_ADDRESS_CACHE_KEY}:${quorumPersonId}`

  const cachedPoliticianAddress = await redis.get<NormalizedQuorumPoliticianAddress>(redisCacheKey)
  if (cachedPoliticianAddress) {
    logger.info(`Found cached address for Quorum ID ${quorumPersonId}`)
    return cachedPoliticianAddress
  }

  logger.info(`Fetching full Quorum profile for ID ${quorumPersonId} to retrieve address fields`)
  const fullProfile = await fetchQuorumByPersonId(quorumPersonId)

  if (!fullProfile) {
    logger.info(`No profile found for Quorum ID ${quorumPersonId}`)
    return
  }

  const addressData: NormalizedQuorumPoliticianAddress = {
    address: fullProfile.address || null,
    officeAddress: fullProfile.officeAddress || null,
  }

  await redis.set(redisCacheKey, addressData, { ex: REDIS_CACHE_TTL_SECONDS })
  logger.info(`Cached address data for Quorum ID ${quorumPersonId}`)

  return addressData
}
