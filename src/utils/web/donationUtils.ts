import { DonationOrganization } from '@prisma/client'

export const formatDonationOrganization = (donationOrganization: DonationOrganization) => {
  switch (donationOrganization) {
    case DonationOrganization.FAIRSHAKE:
      return 'Fairshake'
    case DonationOrganization.STAND_WITH_CRYPTO:
      return 'Stand With Crypto'
  }
}
