import { GetServerSideProps } from 'next';

function generateRobotsTxt() {
  const baseUrl = 'https://legend.hackutd.co';

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Block admin and private pages
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/
Disallow: /register/
Disallow: /profile/
Disallow: /scan/
Disallow: /parking/

# Allow important public pages
Allow: /
Allow: /hackutd2025/
Allow: /live/
Allow: /schedule/
Allow: /docs

# Crawl delay for better server performance
Crawl-delay: 1

# Additional directives for better SEO
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /
`;
}

function RobotsTxt() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = generateRobotsTxt();

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
};

export default RobotsTxt;
