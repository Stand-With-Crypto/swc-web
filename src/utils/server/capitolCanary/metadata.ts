// These metadata information can be provided when creating or updating an advocate in Capitol Canary.

type CapitolCanaryTags =
  | 'C4 Member'
  | 'Smoke Test User'
  | 'tag1'
  | 'tag2'
  | `countryCode:${string}`
  | 'toDelete'

export interface CapitolCanaryMetadata {
  p2aSource?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  tags?: CapitolCanaryTags[]
}
