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
  async redirects() {
    return [
      {
        source: '/typewriter',
        destination: 'https://v0-erstelle-neues-projekt-moevc6.vercel.app/',
        permanent: true, // oder true, wenn es eine dauerhafte Weiterleitung sein soll
      },
    ];
  },
};

module.exports = nextConfig;
