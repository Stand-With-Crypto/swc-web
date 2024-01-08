/** @type {import('next-sitemap').IConfig} */

const excludePaths = ['/404', '/internal']

module.exports = {
  siteUrl: 'https://www.standwithcrypto.org',
  generateRobotsTxt: true, // (optional)
  transform: (config, url) => {
    const parts = url.split('/')
    let changefreq = config.changefreq
    let priority = config.priority
    if (excludePaths.indexOf(`/${parts[1]}`) !== -1) {
      return null
    }
    return {
      loc: url,
      changefreq,
      priority,
    }
  },
}
