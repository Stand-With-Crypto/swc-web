import { ElectoralZone } from '@/utils/server/swcCivic/types'

type FileExtension = 'csv' | 'json'

export type FileName = `${string}.${FileExtension}`

export type CacheContent = {
  placeId: string | null
  description: string
  electoralZone?: ElectoralZone
}[]

export type ErrorsContent = Record<string, string>

export interface Address {
  _count: { id: number }
  formattedDescription: string
  googlePlaceId: string | null
  id: string
}
