import { electoralZones } from '@/data/prisma/generated/swc-civic'

export type ElectoralZone = Pick<electoralZones, 'zoneName' | 'countryCode' | 'administrativeArea'>
