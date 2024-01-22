/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  compiler: {
    styledComponents: true,
  },
};

module.exports = {
  async redirects() {
    return [
      {
        source: '',
        destination: '/start',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
