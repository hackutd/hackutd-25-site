import { useContext } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import CalendarIcon from '@/public/icons/calendar.svg';
import QuestionIcon from '@/public/icons/question.svg';
import HomeIcon from '@/public/icons/home.svg';
import AdminIcon from '@/public/icons/admin.svg';
import ScannerIcon from '@/public/icons/scanner.svg';
import LivestreamIcon from '@/public/icons/livestream.svg';

import { useAuthContext } from '@/lib/user/AuthContext';
import { SectionReferenceContext } from '@/lib/context/section';
import { NavbarCallbackRegistryContext } from '@/lib/context/navbar';
import FloatingDock from './FloatingDock';
import { checkUserPermission } from '@/lib/util';

const allowedRoles = ['admin', 'super_admin'];

type Props = {
  dockItemIdRoot?: string;
};

export default function AppNavbarBottom(props: Props) {
  const { user, hasProfile, signOut } = useAuthContext();
  const { faqRef, scheduleRef } = useContext(SectionReferenceContext);
  const { callbackRegistry } = useContext(NavbarCallbackRegistryContext);
  const router = useRouter();

  const floatingDockItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const itemIdRoot: string = (props.dockItemIdRoot ?? 'AppNavbarBottom-floating-dock-item') + '_';
    let itemIdx = 0;

    // HomeIcon
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }
          if (router.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            router.push('/').then(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          }
        }}
      >
        <HomeIcon />
      </button>,
    );
    itemIdx++;

    // LivestreamIcon
    /*
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }
          if (router.pathname !== '/live') {
            router.push('/live');
          }
        }}
      >
        <LivestreamIcon style={{ width: '30px', height: '30px' }} />
      </button>,
    );
    itemIdx++;
    */

    // CalendarIcon - DIRECT ELEMENT APPROACH
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }

          if (router.pathname === '/') {
            document.getElementById('pre-events-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            router.push('/#pre-events-section');
          }
        }}
      >
        <CalendarIcon />
      </button>,
    );
    itemIdx++;

    // QuestionIcon
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }

          // Function to find and scroll to the FAQ section using multiple methods
          const findAndScrollToFAQ = () => {
            // Try direct element selection by common IDs and classes
            const faqElement =
              document.querySelector('#faq-section') ||
              document.querySelector('#faq') ||
              document.querySelector('.faq-section') ||
              document.querySelector('[id*="faq"]');

            if (faqElement) {
              faqElement.scrollIntoView({ behavior: 'smooth' });
              return true;
            }

            // Try using the contextual ref if available
            if (faqRef && faqRef.current) {
              faqRef.current.scrollIntoView({ behavior: 'smooth' });
              return true;
            }

            // Look for headings that might indicate the FAQ section
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            // Convert NodeList to Array to avoid TypeScript issues
            Array.from(headings).forEach((heading) => {
              if (heading.textContent && heading.textContent.toLowerCase().includes('faq')) {
                heading.scrollIntoView({ behavior: 'smooth' });
                return true;
              }
            });

            // Last resort - look for DOM sections with IDs or classnames containing "faq"
            const allElements = document.querySelectorAll('*');
            // Convert NodeList to Array to avoid TypeScript issues
            let foundElement = false;
            Array.from(allElements).some((element) => {
              const id = element.id || '';
              const className = element.className || '';
              if (
                id.toLowerCase().includes('faq') ||
                (typeof className === 'string' && className.toLowerCase().includes('faq'))
              ) {
                element.scrollIntoView({ behavior: 'smooth' });
                foundElement = true;
                return true; // Break the loop
              }
              return false;
            });

            if (foundElement) {
              return true;
            }

            return false;
          };

          if (router.pathname === '/') {
            // We're on the home page - try direct scrolling with a delay
            setTimeout(() => {
              const success = findAndScrollToFAQ();
              if (!success) {
                console.log('Could not find FAQ section, using hash navigation');
                window.location.hash = 'faq-section';
              }
            }, 200);
          } else {
            // Navigate to home page first, then try to scroll
            router.push('/').then(() => {
              // We need a longer delay after navigation
              setTimeout(() => {
                const success = findAndScrollToFAQ();
                if (!success) {
                  console.log('Could not find FAQ section after navigation, using hash');
                  window.location.hash = 'faq-section';
                }
              }, 500);
            });
          }
        }}
      >
        <QuestionIcon />
      </button>,
    );
    itemIdx++;

    // BookmarkIcon
    /*
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }
          await router.push('/hackerpacks');
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
          />
        </svg>
      </button>,
    );
    itemIdx++;
    */

    // AdminIcon
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }
          await router.push(hasProfile ? '/profile' : '/auth');
        }}
      >
        <AdminIcon />
      </button>,
    );
    itemIdx++;

    // Scanner Icon
    {
      checkUserPermission(user, allowedRoles) &&
        items.push(
          <button
            id={itemIdRoot + itemIdx}
            className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
            onClick={async () => {
              if (Object.hasOwn(callbackRegistry, router.pathname)) {
                await callbackRegistry[router.pathname]();
              }
              await router.push(checkUserPermission(user, allowedRoles) ? '/admin/scan' : '/auth');
            }}
          >
            <ScannerIcon />
          </button>,
        );
      itemIdx++;
    }

    // Sign In/Out Button
    items.push(
      <button
        id={itemIdRoot + itemIdx}
        className={clsx('p-1.5 hover:bg-[rgb(39,39,42)] rounded-full')}
        onClick={async () => {
          if (Object.hasOwn(callbackRegistry, router.pathname)) {
            await callbackRegistry[router.pathname]();
          }
          if (user) {
            await signOut();
          } else {
            await router.push('/auth');
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={
              user
                ? 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75'
                : 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0h3m-3 0h-9m1.5-12H9'
            }
          />
        </svg>
      </button>,
    );
    itemIdx++;
    return items;
  };

  const navbarContent = (
    <div
      className={clsx(
        'md:hidden sticky z-[9999] bottom-0',
        'bg-[rgba(0,0,0,0.70)] p-3 rounded-xl',
        'w-[90%] mx-auto',
        'pointer-events-auto',
        'flex items-center justify-center',
      )}
      style={{
        position: 'fixed',
        bottom: '0',
        left: 0,
        right: 0,
        zIndex: 9999,
        minHeight: '50px',
      }}
    >
      <FloatingDock
        settings={{
          widthScaleFactor: 0,
          distanceMagnify: 0,
        }}
        classes={{
          wrapperDiv: clsx('gap-5 flex items-center justify-center flex-wrap'),
        }}
        items={floatingDockItems()}
      />
    </div>
  );

  return navbarContent;
}
