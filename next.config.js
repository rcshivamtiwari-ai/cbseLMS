/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false };
    return config;
  },
}

module.exports = nextConfig
