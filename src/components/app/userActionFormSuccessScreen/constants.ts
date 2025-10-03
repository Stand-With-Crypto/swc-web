import { UserActionType } from '@prisma/client'
import Cookies from 'js-cookie'

import type { UserActionFormSuccessScreenFeedbackProps } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserActions'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

const isLoggedinWithThirdweb = Cookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      // Default descriptions
      withNFTAndLoggedIn:
        '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.',
      withNFTAndNotLoggedIn:
        'Complete the actions below to continue your progress as a crypto advocate.',
      withoutNFT:
        'Keep up the good work! Complete the actions below to continue your progress as a crypto advocate.',

      // Action titles
      emailTitle: 'You emailed your representatives!',
      optInTitle: 'You joined Stand With Crypto!',
      claimNftTitle: 'You claimed your NFT!',
      voterRegistrationTitle: 'You registered to vote!',
      callTitle: 'You called your representatives!',
      tweetTitle: 'You followed us on X!',
      donationTitle: 'You donated to help keep crypto in America!',
      nftMintTitle: 'Transaction complete',
      voterAttestationTitle: 'You pledged to vote',
      votingInformationResearchedTitle: 'You researched your voting information!',
      votingDayTitle: 'Thanks for doing your part!',
      viewKeyPageTitle: 'You emailed your representatives!',
      linkedinTitle: 'You followed us on LinkedIn!',

      // Action descriptions
      claimNftDescription:
        'Complete the actions below to continue your progress as a crypto advocate.',
      nftMintDescription:
        "You've done your part to save crypto, but the fight isn't over yet. Keep the momentum going by completing the next action below.",
      voterAttestationDescription:
        '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.',
      votingDayDescription:
        "Thanks for doing your part to save crypto this year. We'll send a free NFT to your profile soon. Spread the word and urge others to vote by sharing on X.",
    },
    fr: {
      // Default descriptions
      withNFTAndLoggedIn:
        '... et avez reçu un NFT gratuit pour cela ! Complétez les actions ci-dessous pour continuer votre progression en tant que défenseur de la crypto.',
      withNFTAndNotLoggedIn:
        'Complétez les actions ci-dessous pour continuer votre progression en tant que défenseur de la crypto.',
      withoutNFT:
        'Continuez votre excellent travail ! Complétez les actions ci-dessous pour continuer votre progression en tant que défenseur de la crypto.',

      // Action titles
      emailTitle: 'Vous avez envoyé un email à vos représentants !',
      optInTitle: 'Vous avez rejoint Stand With Crypto !',
      claimNftTitle: 'Vous avez réclamé votre NFT !',
      voterRegistrationTitle: 'Vous vous êtes inscrit pour voter !',
      callTitle: 'Vous avez appelé vos représentants !',
      tweetTitle: 'Vous nous avez suivis sur X !',
      donationTitle: 'Vous avez fait un don pour maintenir la crypto en Amérique !',
      nftMintTitle: 'Transaction terminée',
      voterAttestationTitle: 'Vous vous êtes engagé à voter',
      votingInformationResearchedTitle: 'Vous avez recherché vos informations de vote !',
      votingDayTitle: "Merci d'avoir fait votre part !",
      viewKeyPageTitle: 'Vous avez envoyé un email à vos représentants !',
      linkedinTitle: 'Vous nous avez suivis sur LinkedIn !',

      // Action descriptions
      claimNftDescription:
        'Complétez les actions ci-dessous pour continuer votre progression en tant que défenseur de la crypto.',
      nftMintDescription:
        "Vous avez fait votre part pour sauver la crypto, mais le combat n'est pas encore terminé. Maintenez l'élan en complétant la prochaine action ci-dessous.",
      voterAttestationDescription:
        '... et avez reçu un NFT gratuit pour cela ! Complétez les actions ci-dessous pour continuer votre progression en tant que défenseur de la crypto.',
      votingDayDescription:
        "Merci d'avoir fait votre part pour sauver la crypto cette année. Nous enverrons bientôt un NFT gratuit à votre profil. Faites passer le mot et encouragez les autres à voter en partageant sur X.",
    },
    de: {
      // Default descriptions
      withNFTAndLoggedIn:
        '... und haben dafür ein kostenloses NFT erhalten! Vervollständigen Sie die untenstehenden Aktionen, um Ihren Fortschritt als Krypto-Befürworter fortzusetzen.',
      withNFTAndNotLoggedIn:
        'Vervollständigen Sie die untenstehenden Aktionen, um Ihren Fortschritt als Krypto-Befürworter fortzusetzen.',
      withoutNFT:
        'Machen Sie weiter so! Vervollständigen Sie die untenstehenden Aktionen, um Ihren Fortschritt als Krypto-Befürworter fortzusetzen.',

      // Action titles
      emailTitle: 'Sie haben Ihren Vertretern eine E-Mail gesendet!',
      optInTitle: 'Sie sind Stand With Crypto beigetreten!',
      claimNftTitle: 'Sie haben Ihr NFT beansprucht!',
      voterRegistrationTitle: 'Sie haben sich zur Wahl registriert!',
      callTitle: 'Sie haben Ihre Vertreter angerufen!',
      tweetTitle: 'Sie folgen uns auf X!',
      donationTitle: 'Sie haben gespendet, um Krypto in Amerika zu erhalten!',
      nftMintTitle: 'Transaktion abgeschlossen',
      voterAttestationTitle: 'Sie haben sich zum Wählen verpflichtet',
      votingInformationResearchedTitle: 'Sie haben Ihre Wahlinformationen recherchiert!',
      votingDayTitle: 'Danke, dass Sie Ihren Teil getan haben!',
      viewKeyPageTitle: 'Sie haben Ihren Vertretern eine E-Mail gesendet!',
      linkedinTitle: 'Sie folgen uns auf LinkedIn!',

      // Action descriptions
      claimNftDescription:
        'Vervollständigen Sie die untenstehenden Aktionen, um Ihren Fortschritt als Krypto-Befürworter fortzusetzen.',
      nftMintDescription:
        'Sie haben Ihren Teil getan, um Krypto zu retten, aber der Kampf ist noch nicht vorbei. Halten Sie die Dynamik aufrecht, indem Sie die nächste Aktion unten vervollständigen.',
      voterAttestationDescription:
        '... und haben dafür ein kostenloses NFT erhalten! Vervollständigen Sie die untenstehenden Aktionen, um Ihren Fortschritt als Krypto-Befürworter fortzusetzen.',
      votingDayDescription:
        'Danke, dass Sie dieses Jahr Ihren Teil getan haben, um Krypto zu retten. Wir werden Ihrem Profil bald ein kostenloses NFT senden. Verbreiten Sie das Wort und ermutigen Sie andere zum Wählen, indem Sie auf X teilen.',
    },
  },
})

// Legacy constants for backward compatibility - these use hardcoded English strings
// New code should use getUserActionFormSuccessScreenInfo() function instead for i18n support
export const DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO = {
  WITHOUT_NFT:
    'Keep up the good work! Complete the actions below to continue your progress as a crypto advocate.',
  WITH_NFT: isLoggedinWithThirdweb
    ? '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.'
    : 'Complete the actions below to continue your progress as a crypto advocate.',
}

export const USER_ACTION_FORM_SUCCESS_SCREEN_INFO: Omit<
  Record<ActiveClientUserActionType, UserActionFormSuccessScreenFeedbackProps>,
  'REFER' | 'POLL'
> = {
  [UserActionType.EMAIL]: {
    title: 'You emailed your representatives!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.OPT_IN]: {
    title: 'You joined Stand With Crypto!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITH_NFT'],
  },
  [UserActionType.CLAIM_NFT]: {
    title: 'You claimed your NFT!',
    description: 'Complete the actions below to continue your progress as a crypto advocate.',
  },
  [UserActionType.VOTER_REGISTRATION]: {
    title: 'You registered to vote!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.CALL]: {
    title: 'You called your representatives!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITH_NFT'],
  },
  [UserActionType.TWEET]: {
    title: 'You followed us on X!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.DONATION]: {
    title: 'You donated to help keep crypto in America!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.NFT_MINT]: {
    title: 'Transaction complete',
    description:
      "You've done your part to save crypto, but the fight isn't over yet. Keep the momentum going by completing the next action below.",
  },
  [UserActionType.VOTER_ATTESTATION]: {
    title: 'You pledged to vote',
    description:
      '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.',
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    title: 'You researched your voting information!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.VOTING_DAY]: {
    title: 'Thanks for doing your part!',
    description:
      "Thanks for doing your part to save crypto this year. We'll send a free NFT to your profile soon. Spread the word and urge others to vote by sharing on X.",
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'You emailed your representatives!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.LINKEDIN]: {
    title: 'You followed us on LinkedIn!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
}

export const getUserActionFormSuccessScreenInfo = ({
  actionType,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language = SupportedLanguages.EN,
}: {
  actionType: Exclude<ActiveClientUserActionType, 'REFER' | 'POLL'>
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const messagesByType: Omit<
    Record<ActiveClientUserActionType, UserActionFormSuccessScreenFeedbackProps>,
    'REFER' | 'POLL'
  > = {
    [UserActionType.EMAIL]: {
      title: t('emailTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.OPT_IN]: {
      title: t('optInTitle'),
      description: isLoggedinWithThirdweb ? t('withNFTAndLoggedIn') : t('withNFTAndNotLoggedIn'),
    },
    [UserActionType.CLAIM_NFT]: {
      title: t('claimNftTitle'),
      description: t('claimNftDescription'),
    },
    [UserActionType.VOTER_REGISTRATION]: {
      title: t('voterRegistrationTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.CALL]: {
      title: t('callTitle'),
      description: isLoggedinWithThirdweb ? t('withNFTAndLoggedIn') : t('withNFTAndNotLoggedIn'),
    },
    [UserActionType.TWEET]: {
      title: t('tweetTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.DONATION]: {
      title: t('donationTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.NFT_MINT]: {
      title: t('nftMintTitle'),
      description: t('nftMintDescription'),
    },
    [UserActionType.VOTER_ATTESTATION]: {
      title: t('voterAttestationTitle'),
      description: t('voterAttestationDescription'),
    },
    [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
      title: t('votingInformationResearchedTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.VOTING_DAY]: {
      title: t('votingDayTitle'),
      description: t('votingDayDescription'),
    },
    [UserActionType.VIEW_KEY_PAGE]: {
      title: t('viewKeyPageTitle'),
      description: t('withoutNFT'),
    },
    [UserActionType.LINKEDIN]: {
      title: t('linkedinTitle'),
      description: t('withoutNFT'),
    },
  }

  return messagesByType[actionType]
}
