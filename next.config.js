/** @type {import('next').NextConfig} */

// TODO bring over old configs

const nextConfig = {
  images: {
    remotePatterns: [
      // dotheysupportit image cdn
      { protocol: 'https', hostname: 'db0prh5pvbqwd.cloudfront.net' },
    ],
  },
}

module.exports = nextConfig
