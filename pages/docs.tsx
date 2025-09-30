import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';

export default function Docs() {
  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.SwaggerUIBundle({
          url: '/openapi.yaml',
          dom_id: '#swagger-ui',
        });
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>HackUTD 2025: Lost in the Pages - API Documentation</title>
        <meta
          name="description"
          content="API documentation for HackUTD 2025: Lost in the Pages hackathon. Access endpoints, schemas, and integration guides for developers."
        />
        <meta
          name="keywords"
          content="HackUTD 2025, API docs, hackathon API, Lost in the Pages, developer documentation, REST API"
        />
        <link rel="canonical" href="https://legend.hackutd.co/docs" />
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </Head>
      <Script
        src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <div id="swagger-ui" />
    </>
  );
}
