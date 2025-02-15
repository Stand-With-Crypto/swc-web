import { runBin } from '@/bin/runBin'
import { testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress } from '@/bin/smokeTests/onNewLogin/3testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress'
import { testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress } from '@/bin/smokeTests/onNewLogin/4testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSameCryptoAddress'
import { testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers } from '@/bin/smokeTests/onNewLogin/5testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers'
import { testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount } from '@/bin/smokeTests/onNewLogin/6testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount'
import { testCaseMultipleUsersWithSameLegacyCryptoAddress } from '@/bin/smokeTests/onNewLogin/7testCaseMultipleUsersWithSameLegacyCryptoAddress'
import { testCaseMultipleUsersWithSameLegacyEmail } from '@/bin/smokeTests/onNewLogin/8testCaseMultipleUsersWithSameLegacyEmail'
import { testCaseWithLongAcquisitionReferer } from '@/bin/smokeTests/onNewLogin/9testCaseWithLongAcquisitionReferrer'
import { testCaseWithPhoneSignUp } from '@/bin/smokeTests/onNewLogin/10testCaseWithPhoneSignUp'
import { testCaseWithPhoneSignUpWithExistingAccount } from '@/bin/smokeTests/onNewLogin/11testCaseWithPhoneSignUpWithExistingAccount'
import { testCaseWithValidReferral } from '@/bin/smokeTests/onNewLogin/12testCaseWithValidReferral'
import { onNewLogin } from '@/utils/server/thirdweb/onLogin'
import { logger } from '@/utils/shared/logger'

import { testCaseNewUser } from './1testCaseNewUser'
import { testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail } from './2testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail'
import { Issue, TestCase } from './utils'

async function runTestCase({ validateResults, parameters, name }: TestCase) {
  logger.info(`------TEST CASE STARTED------: ${name}`)
  const params = await parameters()
  const data = await onNewLogin(params)
  const issues: Issue[] = []
  validateResults(data, issues)
  if (issues.length > 0) {
    throw new Error(`------TEST CASE ISSUES------: Issues with ${name}:\n${issues.join('\n')}`)
  }
  logger.info(`------TEST CASE PASSED------: ${name}`)
}

async function smokeTestOnLogin() {
  const tests = [
    testCaseNewUser,
    testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail,
    testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress,
    testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress,
    testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers,
    testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount,
    testCaseMultipleUsersWithSameLegacyCryptoAddress,
    testCaseMultipleUsersWithSameLegacyEmail,
    testCaseWithLongAcquisitionReferer,
    testCaseWithPhoneSignUp,
    testCaseWithPhoneSignUpWithExistingAccount,
    testCaseWithValidReferral,
  ]
  for (const test of tests) {
    await runTestCase(test)
  }
}

void runBin(smokeTestOnLogin)
