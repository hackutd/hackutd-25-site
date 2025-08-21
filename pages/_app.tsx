import '../styles/globals.css';
import '../styles/tailwind.css';

import 'firebase/compat/auth';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AppProps } from 'next/dist/shared/lib/router/router';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { initFirebase } from '@/lib/firebase-client';
import { AuthProvider } from '@/lib/user/AuthContext';
import { FCMProvider } from '@/lib/service-worker/FCMContext';

import AppHeader from '@/components/AppHeader';
import AppNavbarBottom from '@/components/AppNavbarBottom';

import { NavbarCallbackRegistryContext } from '@/lib/context/navbar';
import { SectionReferenceContext } from '@/lib/context/section';
import { useUrlHash } from '@/lib/hooks';

initFirebase();

/**
 * A Wrapper for the HackPortal web app.
 *
 * This is the root of the component heirarchy. When the site is hydrated, this
 * will load into memory and never re-initialize unless the page refreshes.
 */
function PortalApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hash = useUrlHash('');

  const noTopSpacerPathnames = new Set(['/', '/parking', '/live', '/register']);

  const faqRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const scheduleRef = useRef<HTMLDivElement | null>(null);

  const [callbackRegistry, setCallbackRegistry] = useState<Record<string, () => Promise<unknown>>>(
    {},
  );

  useEffect(() => {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <FCMProvider>
          <SectionReferenceContext.Provider
            value={{
              faqRef,
              aboutRef,
              scheduleRef,
            }}
          >
            <NavbarCallbackRegistryContext.Provider
              value={{
                callbackRegistry,
                setCallback: (pathname, cb) => {
                  setCallbackRegistry((prev) => ({ ...prev, [pathname]: cb }));
                },
                removeCallback: (pathname) => {
                  setCallbackRegistry((prev) => {
                    if (!Object.hasOwn(prev, pathname)) {
                      return prev;
                    }
                    const newRegistry = { ...prev };
                    delete newRegistry[pathname];
                    return newRegistry;
                  });
                },
              }}
            >
              <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                  name="viewport"
                  content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <title>HackUTD 2025</title> {/* !change */}
                <meta name="description" content="Your all-in-one guide to this hackathon." />
                {process.env.ENABLE_PWA ||
                  (process.env.NODE_ENV !== 'development' && (
                    <link rel="manifest" href="/manifest.json" />
                  ))}
                <link href="/icons/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
                <link href="/icons/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
                <meta name="theme-color" content="#5D5FEF" />
                {/* Preload critical resources */}
                <link rel="preload" href="/assets/topDrawing/mobileBG-optimized.jpg" as="image" />
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//s3.amazonaws.com" />
              </Head>

              <div className="min-h-screen flex flex-col">
                <AppHeader />
                {/* Spacer at the top of the page so that content won't be covered by the navbar */}
                {!noTopSpacerPathnames.has(router.pathname) && (
                  <div className="h-[86px] shrink-0" />
                )}
                <Component {...pageProps} />
                {/* Spacer at the bottom of the page for navbar bottom on mobile, so that content won't be covered by the navbar */}
                <div className="md:hidden h-[80px] shrink-0" />
              </div>
              <AppNavbarBottom />
            </NavbarCallbackRegistryContext.Provider>
          </SectionReferenceContext.Provider>
        </FCMProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default PortalApp;
