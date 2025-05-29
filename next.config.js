/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fixes for Electron build
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'electron': 'require("electron")',
        'nodemailer': 'commonjs nodemailer',
      });
    }
    return config;
  },
}

module.exports = nextConfig