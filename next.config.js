const runtimeCaching = require('next-pwa/cache');
const withFonts = require('next-fonts');

const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
  disable: !process.env.ENABLE_PWA && process.env.NODE_ENV === 'development',
});

(module.exports = withPWA({
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/travel-reimbursement',
        destination:
          'https://hackutd.notion.site/HackUTD-2025-Lost-in-the-Pages-Travel-Reimbursement-13e0d994cbb981c5a336f1dda3e5d3be',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    // Optimize images for better performance
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // https://sebhastian.com/javascript-unexpected-token-export/
  // https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages
  transpilePackages: ['@ant-design/icons-svg', 'rc-util'],

  webpack(config, options) {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    // For loading svg as React component
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize bundle size
    if (!options.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
})),
  withFonts({
    enableSvg: true,
    webpack(config, options) {
      return config;
    },
  });
