import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

import { fullUrl } from './fullUrl'

export const externalUrls = {
  dtsi: () => 'https://www.dotheysupportit.com',
  dtsiCreateStance: (slug: string) =>
    `https://www.dotheysupportit.com/people/${slug}/create-stance`,
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

// TODO: fill in
export const auExternalUrls = {
  discord: usExternalUrls.discord,
  twitter: usExternalUrls.twitter,
  instagram: usExternalUrls.instagram,
  youtube: usExternalUrls.youtube,
  facebook: usExternalUrls.facebook,
  linkedin: usExternalUrls.linkedin,
  emailFeedback: usExternalUrls.emailFeedback,
}

// TODO: fill in
export const gbExternalUrls = {
  discord: usExternalUrls.discord,
  twitter: usExternalUrls.twitter,
  instagram: usExternalUrls.instagram,
  youtube: usExternalUrls.youtube,
  facebook: usExternalUrls.facebook,
  linkedin: usExternalUrls.linkedin,
  emailFeedback: usExternalUrls.emailFeedback,
}

// TODO: fill in
export const caExternalUrls = {
  discord: usExternalUrls.discord,
  twitter: usExternalUrls.twitter,
  instagram: usExternalUrls.instagram,
  youtube: usExternalUrls.youtube,
  facebook: usExternalUrls.facebook,
  linkedin: usExternalUrls.linkedin,
  emailFeedback: usExternalUrls.emailFeedback,
}
