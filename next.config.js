/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // dotheysupportit image cdn
      { protocol: 'https', hostname: 'db0prh5pvbqwd.cloudfront.net' },
    ],
  },
}

module.exports = nextConfig
