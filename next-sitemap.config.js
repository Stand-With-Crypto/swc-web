/** @type {import('next-sitemap').IConfig} */
const { US_STATE_ALLOW_LIST } = require('./src/utils/shared/locationSpecificPages')

const excludePaths = ['/404', '/internal']

module.exports = {
  siteUrl: 'https://www.standwithcrypto.org',
  generateRobotsTxt: true, // (optional)
  transform: (config, url) => {
    const parts = url.split('/')
    let changefreq = config.changefreq
    let priority = config.priority
    if (parts[1] === 'api') {
      return null
    }
    if (excludePaths.indexOf(`/${parts[2]}`) !== -1) {
      return null
    }
    if (url.includes('/locations/us/state/')) {
      const state = parts[parts.indexOf('state') + 1]
      const district = parts.includes('district') ? parts[parts.indexOf('district') + 1] : null
      US_STATE_ALLOW_LIST.find(allowedState => {
        if (typeof allowedState === 'string') {
          return allowedState === state
        }
        if (!district) {
          return allowedState.stateCode === state
        }
        return (
          allowedState.stateCode === state &&
          allowedState.districts.find(d => `${d}` === `${district}`)
        )
      })
    }
    return {
      loc: url,
      changefreq,
      priority,
    }
  },
}
