import {
  AU_ACTIONS_METADATA_BY_TYPE,
  AU_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION,
  AUEmailActiveActions,
  AUEmailEnabledActionNFTs,
} from '@/utils/server/email/templates/au/constants'
import {
  CA_ACTIONS_METADATA_BY_TYPE,
  CA_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION,
  CAEmailActiveActions,
  CAEmailEnabledActionNFTs,
} from '@/utils/server/email/templates/ca/constants'
import {
  GB_ACTIONS_METADATA_BY_TYPE,
  GB_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION,
  GBEmailActiveActions,
  GBEmailEnabledActionNFTs,
} from '@/utils/server/email/templates/gb/constants'
import {
  US_ACTIONS_METADATA_BY_TYPE,
  US_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION,
  USEmailActiveActions,
  USEmailEnabledActionNFTs,
} from '@/utils/server/email/templates/us/constants'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getEmailActionsMetadataByCountry(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return US_ACTIONS_METADATA_BY_TYPE
    case SupportedCountryCodes.AU:
      return AU_ACTIONS_METADATA_BY_TYPE
    case SupportedCountryCodes.CA:
      return CA_ACTIONS_METADATA_BY_TYPE
    case SupportedCountryCodes.GB:
      return GB_ACTIONS_METADATA_BY_TYPE
    default:
      return gracefullyError({
        msg: `No email actions metadata found for country code`,
        fallback: {},
        hint: {
          tags: {
            domain: 'email',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export type EmailActiveActions =
  | AUEmailActiveActions
  | CAEmailActiveActions
  | GBEmailActiveActions
  | USEmailActiveActions

export function getEmailActiveActionsByCountry(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USEmailActiveActions
    case SupportedCountryCodes.AU:
      return AUEmailActiveActions
    case SupportedCountryCodes.CA:
      return CAEmailActiveActions
    case SupportedCountryCodes.GB:
      return GBEmailActiveActions
    default:
      return gracefullyError({
        msg: `No email active actions found for country code`,
        fallback: {},
        hint: {
          tags: {
            domain: 'email',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export type EmailEnabledActionNFTs = USEmailEnabledActionNFTs

export function getEmailEnabledActionNFTsByCountry(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USEmailEnabledActionNFTs
    case SupportedCountryCodes.AU:
      return AUEmailEnabledActionNFTs
    case SupportedCountryCodes.CA:
      return CAEmailEnabledActionNFTs
    case SupportedCountryCodes.GB:
      return GBEmailEnabledActionNFTs
    default:
      return gracefullyError({
        msg: `No email enabled action nfts found for country code`,
        fallback: {},
        hint: {
          tags: { domain: 'email' },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export const getEmailActiveActionFromNFTSlug = (
  nftSlug: NFTSlug,
  countryCode: SupportedCountryCodes,
) => {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return US_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION[nftSlug]
    case SupportedCountryCodes.CA:
      return CA_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION[nftSlug]
    case SupportedCountryCodes.GB:
      return GB_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION[nftSlug]
    case SupportedCountryCodes.AU:
      return AU_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION[nftSlug]
    default:
      return gracefullyError({
        msg: `No active email action found for nft slug`,
        fallback: null,
        hint: {
          tags: { domain: 'email' },
          extra: {
            nftSlug,
            countryCode,
          },
        },
      })
  }
}
