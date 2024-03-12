import { expect } from '@jest/globals'
import * as Bowser from 'bowser'
import { uniq } from 'lodash-es'

import { getIsSupportedBrowser } from './maybeDetectBrowser'

const SAMPLE_SUPPORTED_BROWSERS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

// add to this list as we encounter additional legacy crashes in sentry
const SAMPLE_UNSUPPORTED_BROWSERS = [
  'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; CPH2307) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 11_4_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) GSA/57.0.209471814 Mobile/15G77 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 10; JNY-LX1 Build/HUAWEIJNY-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.64 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/274.0.0.46.119;]',
  'Mozilla/5.0 (Linux; Android 8.1.0; S23 Ultra Build/O11019; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36 Instagram 320.0.0.42.101 Android (27/8.1.0; 320dpi; 720x1544; alps; S23 Ultra; S23_Ultra; mt6735; es_MX; 570684018)',
  'Mozilla/5.0 (Linux; Android 8.1.0; LM-Q710(FGN) Build/OPM1.171019.019; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/439.0.0.44.117;]',
  'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36',
  'Mozilla/5.0 (Android 9; Mobile; rv:122.0) Gecko/122.0 Firefox/122.0 DatadogSynthetics',
]

function parseOption(str: string) {
  const parsed = Bowser.parse(str)
  // console.log(parsed)
  return getIsSupportedBrowser(parsed)
}

it('supports the right browsers', () => {
  expect(uniq(SAMPLE_SUPPORTED_BROWSERS.map(parseOption))).toEqual([true])
  expect(uniq(SAMPLE_UNSUPPORTED_BROWSERS.map(parseOption))).toEqual([false])
})
