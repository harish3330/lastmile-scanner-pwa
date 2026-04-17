/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config) => {
    // Exclude test files from being treated as pages
    config.module.rules.forEach((rule) => {
      if (rule.test?.test?.('.js')) {
        rule.exclude = [
          rule.exclude,
          /\.test\.(js|jsx|ts|tsx)$/,
          /__tests__\//,
        ].filter(Boolean);
      }
    });
    return config;
  },
}

module.exports = nextConfig
