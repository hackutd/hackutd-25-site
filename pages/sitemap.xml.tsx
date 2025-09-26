import { GetServerSideProps } from 'next';

function generateSiteMap() {
  const baseUrl = 'https://legend.hackutd.co';
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${currentDate}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
       <image:image>
         <image:loc>${baseUrl}/assets/og-image.jpg</image:loc>
         <image:title>HackUTD 2025: Lost in the Pages</image:title>
         <image:caption>Join the largest university hackathon in North America</image:caption>
       </image:image>
     </url>
     <url>
       <loc>${baseUrl}/hackutd2025</loc>
       <lastmod>${currentDate}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${baseUrl}/live</loc>
       <lastmod>${currentDate}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${baseUrl}/schedule</loc>
       <lastmod>${currentDate}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${baseUrl}/docs</loc>
       <lastmod>${currentDate}</lastmod>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
