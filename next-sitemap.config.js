/** @type {import('next-sitemap').IConfig} */

const excludePaths = ['/404', '/internal']

//  TODO figure out why politician details pages are not being indexed
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
