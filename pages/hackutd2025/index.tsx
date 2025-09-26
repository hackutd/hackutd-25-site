import React, { useEffect } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

const HackUTD2025Page: NextPage = () => {
  useEffect(() => {
    // Redirect to the external guide
    window.location.href = 'https://guide.hackutd.co/dayof';
  }, []);

  return (
    <>
      <Head>
        <title>HackUTD 2025: Lost in the Pages - Day of Guide</title>
        <meta
          name="description"
          content="Access the complete day-of guide for HackUTD 2025: Lost in the Pages hackathon. Find everything you need for the event on Nov 8-9, 2025."
        />
        <meta
          name="keywords"
          content="HackUTD 2025 guide, Lost in the Pages, day of guide, hackathon guide, event information"
        />
        <link rel="canonical" href="https://legend.hackutd.co/hackutd2025" />
        <meta httpEquiv="refresh" content="0; url=https://guide.hackutd.co/dayof" />
      </Head>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Redirecting to HackUTD 2025 Guide...</h2>
          <p>
            If you are not redirected automatically,{' '}
            <a href="https://guide.hackutd.co/dayof">click here</a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default HackUTD2025Page;
