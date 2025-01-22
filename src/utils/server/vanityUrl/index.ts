import { redis } from "@/utils/server/redis"

export const VANITY_URLS_KEY = 'vanityUrls'

export interface VanityUrl {
  source: string
  destination: string
  permanent: boolean
}

export async function getVanityUrls(): Promise<VanityUrl[]> {
  return await redis.lrange<VanityUrl>(VANITY_URLS_KEY, 0, -1)
}

export async function setVanityUrl(newVanity: VanityUrl) {
  console.log('newVanity', newVanity)

  return await redis.rpush(VANITY_URLS_KEY, JSON.stringify(newVanity))
}

export async function deleteVanityUrl(vanityUrl: VanityUrl) {
  return await redis.lrem(VANITY_URLS_KEY, 0, JSON.stringify(vanityUrl))
}
