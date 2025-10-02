import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic meta tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="Join HackUTD 2025: Lost in the Pages, the largest 24-hour university hackathon in North America. Build innovative apps, hardware, and solutions with 1200+ hackers from 30+ universities. Nov 8-9, 2025 at UT Dallas."
        />
        <meta
          name="keywords"
          content="HackUTD 2025, Lost in the Pages, hackathon, UT Dallas, university hackathon, programming competition, tech event, North America, largest hackathon, student hackathon, coding event, hackutd lost in the pages, hackutd 2025"
        />
        <meta name="author" content="HackUTD" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href="https://legend.hackutd.co" />

        {/* Geographic meta tags */}
        <meta name="geo.region" content="US-TX" />
        <meta name="geo.placename" content="Richardson" />
        <meta name="geo.position" content="32.9858;-96.7501" />
        <meta name="ICBM" content="32.9858, -96.7501" />

        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://legend.hackutd.co/" />
        <meta
          property="og:title"
          content="HackUTD 2025: Lost in the Pages - Largest University Hackathon in North America"
        />
        <meta
          property="og:description"
          content="Join HackUTD 2025: Lost in the Pages, the largest 24-hour university hackathon in North America. Build innovative apps, hardware, and solutions with 1200+ hackers from 30+ universities. Nov 8-9, 2025 at UT Dallas."
        />
        <meta property="og:image" content="https://legend.hackutd.co/assets/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="HackUTD" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://legend.hackutd.co/" />
        <meta
          name="twitter:title"
          content="HackUTD 2025: Lost in the Pages - Largest University Hackathon in North America"
        />
        <meta
          name="twitter:description"
          content="Join HackUTD 2025: Lost in the Pages, the largest 24-hour university hackathon in North America. Build innovative apps, hardware, and solutions with 1200+ hackers from 30+ universities. Nov 8-9, 2025 at UT Dallas."
        />
        <meta name="twitter:image" content="https://legend.hackutd.co/assets/og-image.jpg" />
        <meta name="twitter:site" content="@hackutd" />
        <meta name="twitter:creator" content="@hackutd" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B0B1B" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
