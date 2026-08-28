/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/start',
        permanent: true,
      },
      {
        source: '/typewriter',
        destination: 'https://v0-erstelle-neues-projekt-moevc6.vercel.app/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
