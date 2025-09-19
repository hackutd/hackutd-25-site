import React, { useEffect } from 'react';
import type { NextPage } from 'next';

const HackUTD2025Page: NextPage = () => {
  useEffect(() => {
    // Redirect to the external guide
    window.location.href = 'https://guide.hackutd.co/dayof';
  }, []);

  return (
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
  );
};

export default HackUTD2025Page;
