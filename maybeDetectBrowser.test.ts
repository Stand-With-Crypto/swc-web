import { expect } from '@jest/globals'
import { detect } from 'detect-browser'
import { uniq } from 'lodash-es'

import { getIsSupportedBrowser } from './maybeDetectBrowser'

const SAMPLE_SUPPORTED_BROWSERS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

// add to this list as we encounter additional legacy crashes in sentry
const SAMPLE_UNSUPPORTED_BROWSERS = [
  'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
]

it('supports the right browsers', () => {
  expect(uniq(SAMPLE_SUPPORTED_BROWSERS.map(x => getIsSupportedBrowser(detect(x))))).toEqual([true])
  expect(uniq(SAMPLE_UNSUPPORTED_BROWSERS.map(x => getIsSupportedBrowser(detect(x))))).toEqual([
    false,
  ])
})
