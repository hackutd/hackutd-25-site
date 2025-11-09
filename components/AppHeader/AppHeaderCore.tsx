import { Fragment, useContext } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import { useAuthContext } from '@/lib/user/AuthContext';
import { NavbarCallbackRegistryContext } from '@/lib/context/navbar';

import AdminNavbarGrid from './AdminNavbarGrid';
import FloatingDock from '../FloatingDock';

type Props = {
  dockItemIdRoot?: string;
};

export default function AppHeaderCore(props: Props) {
  const { user, hasProfile, signOut } = useAuthContext();
  const { callbackRegistry } = useContext(NavbarCallbackRegistryContext);

  const router = useRouter();

  const isSuperAdmin = user ? user.permissions.indexOf('super_admin') !== -1 : false;
  const isAdmin = isSuperAdmin || (user ? user.permissions.indexOf('admin') !== -1 : false);

  const mainDockItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const itemIdRoot: string = (props.dockItemIdRoot ?? 'AppHeader2-Core-mainDockItems') + '_';
    let itemIdx = 0;

    const navItems = [
      {
        text: 'Home',
        onClick: () => {
          if (router.pathname === '/') {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          } else {
            window.location.href = '/';
          }
        },
      },
      {
        text: 'Schedule',
        onClick: () => {
          console.log('Desktop Schedule button clicked, pathname:', router.pathname);
          if (router.pathname === '/') {
            const element = document.getElementById('schedule-section');
            console.log('Found schedule-section element:', element);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            } else {
              console.log('schedule-section not found');
            }
          } else {
            console.log('Navigating to /#schedule-section');
            router.push('/#schedule-section');
          }
        },
      },
      {
        text: 'FAQ',
        onClick: () => {
          if (router.pathname === '/') {
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            router.push('/#faq-section');
          }
        },
      },
      {
        text: 'Livestream',
        onClick: () => {
          router.push('/live');
        },
      },
      {
        text: 'Hackerpack',
        onClick: () => {
          window.open('https://guide.hackutd.co/dayof/', '_blank');
        },
      },
    ];

    navItems.map((item, idx) => {
      items.push(
        <button
          id={itemIdRoot + idx}
          onClick={item.onClick}
          className={clsx(
            'py-2 px-4 text-[#2D5016] cursor-pointer flex justify-center font-bold',
            'hover:bg-[#8FBC8F] transition-[background] duration-300 ease-in-out',
            'rounded-[20px]',
          )}
        >
          {item.text}
        </button>,
      );

      itemIdx += 1;
    });

    if (isAdmin) {
      items.push(
        <Menu id={itemIdRoot + itemIdx} as="div">
          <Menu.Button
            className={clsx(
              'py-2 px-4 text-[#2D5016] cursor-pointer flex gap-1 items-center justify-center font-bold',
              'hover:bg-[#8FBC8F] transition-[background] duration-300 ease-in-out',
              'rounded-[20px]',
            )}
          >
            <div className="text-[#2D5016]">Admin</div>
            <svg
              xmlns="http:www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#2D5016"
              className="size-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-auto min-w-[300px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
              <div className="p-1">
                <AdminNavbarGrid
                  numCols={2}
                  sectionTitle="Admin"
                  options={[
                    {
                      optionName: 'Event Dashboard',
                      onClick: () => router.push('/admin'),
                    },
                    {
                      optionName: 'Scanner',
                      onClick: () => router.push('/admin/scan'),
                    },
                    {
                      optionName: 'User Dashboard',
                      onClick: () => router.push('/admin/users'),
                    },
                    {
                      optionName: 'Late Check-in',
                      onClick: () => router.push('/admin/waitlist'),
                    },
                    ...(isSuperAdmin
                      ? [
                          {
                            optionName: 'Stats at a Glance',
                            onClick: () => router.push('/admin/stats'),
                          },
                          {
                            optionName: 'Check-In Counter',
                            onClick: () => router.push('/admin/checkin-counter'),
                          },
                          {
                            optionName: 'Decision Control',
                            onClick: () => router.push('/admin/decisions'),
                          },
                        ]
                      : []),
                    ...(isAdmin
                      ? [
                          {
                            optionName: 'Admin Leaderboard',
                            onClick: () => router.push('/admin/leaderboard'),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </Menu.Items>
          </Transition>
        </Menu>,
      );
      itemIdx++;
    }

    // Profile/Apply button
    // TODO: Read after applications open
    if (user && hasProfile) {
      items.push(
        <div id={itemIdRoot + itemIdx} className="p-2 text-white cursor-pointer">
          <button
            onClick={async () => {
              if (Object.hasOwn(callbackRegistry, router.pathname)) {
                await callbackRegistry[router.pathname]();
              }
              await router.push('/profile');
            }}
          >
            <div className="py-3 px-5 rounded-[30px] bg-[#2D5016] font-bold">Profile</div>
          </button>
        </div>,
      );
      itemIdx++;
    }

    return items;
  };

  return (
    <div className="flex justify-center py-2 w-full">
      {/* Real navbar */}
      <div
        id="nav-bar"
        className="relative font-dmSans border-[3px] border-[rgba(30,30,30,0.60)] rounded-xl p-1 bg-white opacity-90 text-[#2D5016] cursor-pointer flex items-center justify-center gap-4"
      >
        <FloatingDock
          classes={{
            wrapperDiv: clsx('gap-4 flex items-center justify-center nowrap overflow-x-auto'),
          }}
          items={mainDockItems()}
        />

        {/* Sign out button */}
        <button
          className={clsx(
            'text-sm py-3 px-4 rounded-[30px] bg-[#2D5016] font-bold text-white border-2 border-white',
          )}
          onClick={async () => {
            if (user) {
              await signOut();
            } else {
              await router.push('/auth');
            }
          }}
        >
          {user ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
