import { runBin } from '@/bin/runBin'
import { testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress } from '@/bin/smokeTests/onNewLogin/3testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress'
import { testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress } from '@/bin/smokeTests/onNewLogin/4testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSameCryptoAddress'
import { testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers } from '@/bin/smokeTests/onNewLogin/5testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers'
import { testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount } from '@/bin/smokeTests/onNewLogin/6testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount'
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
  ]
  for (const test of tests) {
    await runTestCase(test)
  }
}

runBin(smokeTestOnLogin)
