import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

import { fullUrl } from './fullUrl'

export const externalUrls = {
  swcReferralUrl: ({ referralId }: { referralId: string }) => fullUrl(`/join/${referralId}`),
}

export const usExternalUrls = {
  discord: () => 'https://discord.com/invite/standwithcrypto',
  donate: () =>
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 'https://commerce.coinbase.com/checkout/396fc233-3d1f-4dd3-8e82-6efdf78432ad'
      : 'https://commerce.coinbase.com/checkout/582a836d-733c-4a66-84d9-4e3c40c90281',
  emailFeedback: () => 'mailto:info@standwithcrypto.org',
  facebook: () => 'https://www.facebook.com/standwithcrypto',
  instagram: () => 'https://www.instagram.com/standwithcrypto/',
  linkedin: () => 'https://www.linkedin.com/company/standwithcrypto/',
  twitter: () => 'https://twitter.com/standwithcrypto',
  youtube: () => 'https://www.youtube.com/@StandWithCryptoAlliance/featured',
  swcOnChainSummer: () => 'https://onchainsummer.xyz/standwithcrypto',
  swcQuestionnaire: () => 'https://standwithcrypto.typeform.com/questionnaire',
}

export const auExternalUrls = {
  twitter: () => 'https://x.com/StandWCrypto_AU',
  linkedin: () => 'https://www.linkedin.com/company/stand-with-crypto-australia',
  emailFeedback: usExternalUrls.emailFeedback,
}

export const gbExternalUrls = {
  twitter: () => 'https://x.com/StandWCrypto_UK',
  linkedin: () => 'https://www.linkedin.com/company/standwithcryptouk',
  emailFeedback: usExternalUrls.emailFeedback,
}

export const caExternalUrls = {
  twitter: () => 'https://x.com/StandWCrypto_CA',
  linkedin: () => 'https://www.linkedin.com/company/stand-with-crypto-canada',
  emailFeedback: usExternalUrls.emailFeedback,
}
