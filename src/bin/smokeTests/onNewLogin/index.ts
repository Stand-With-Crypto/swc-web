import { runBin } from '@/bin/runBin'
import { onNewLogin } from '@/utils/server/thirdweb/onLogin'
import { logger } from '@/utils/shared/logger'

import { TestCase, Issue } from './utils'
import { testCaseNewUser } from './1testCaseNewUser'
import { testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail } from './2testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail'
import { testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress } from '@/bin/smokeTests/onNewLogin/3testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress'
import { testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress } from '@/bin/smokeTests/onNewLogin/4testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSameCryptoAddress'

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
    // testCaseNewUser,
    // testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail,
    // testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress,
    testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress,
  ]
  for (const test of tests) {
    await runTestCase(test)
  }
}

runBin(smokeTestOnLogin)
