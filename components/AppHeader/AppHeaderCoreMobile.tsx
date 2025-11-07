import { useAuthContext } from '@/lib/user/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import AdminNavbarColumn from './AdminNavbarColumn';
import { useRouter } from 'next/router';
import AdminNavbarGrid from './AdminNavbarGrid';
import { RequestHelper } from '@/lib/request-helper';
import QRScanDialog from './QRScanDialog';
import FloatingDockWrapper from '../FloatingDock';
import clsx from 'clsx';

type Props = {
  dockItemIdRoot?: string;
};

type Scan = {
  precendence: number;
  name: string;
  isCheckIn: boolean;
  startTime: Date;
  endTime: Date;
  isPermanentScan: boolean;
};

export default function AppHeaderCoreMobile(props: Props) {
  const { user } = useAuthContext();
  const router = useRouter();

  const isSuperAdmin = user ? user.permissions.indexOf('super_admin') !== -1 : false;
  const isAdmin = isSuperAdmin || (user ? user.permissions.indexOf('admin') !== -1 : false);

  const [scanList, setScanList] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);

  useEffect(() => {
    async function getScanData() {
      const scans = await RequestHelper.get<Scan[]>('/api/scantypes', {
        headers: {
          authorization: user?.token || '',
        },
      });
      setScanList(scans.data);
    }
    if (!isAdmin) {
      setScanList([]);
    } else {
      getScanData();
    }
  }, [user, isAdmin]);

  const mainDockItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const itemIdRoot: string = (props.dockItemIdRoot ?? 'AppHeader2-Core-mainDockItems') + '_';
    let itemIdx = 0;

    // Basic navigation items for all users
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
          if (router.pathname === '/') {
            document.getElementById('pre-events-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            router.push('/#pre-events-section');
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

    navItems.forEach((item, idx) => {
      items.push(
        <button
          key={itemIdRoot + idx}
          id={itemIdRoot + idx}
          onClick={item.onClick}
          className={clsx(
            'py-2 px-4 text-[#40B7BA] cursor-pointer flex justify-center font-bold',
            'hover:bg-[#DFFEFF] transition-[background] duration-300 ease-in-out',
            'rounded-[20px]',
          )}
        >
          {item.text}
        </button>,
      );
      itemIdx++;
    });

    if (isAdmin) {
      items.push(
        <Menu id={itemIdRoot + itemIdx} as="div">
          <div
            className={clsx(
              'py-2 px-4 text-[#40B7BA] cursor-pointer flex gap-1 items-center justify-center font-bold',
              'hover:bg-[#DFFEFF] transition-[background] duration-300 ease-in-out',
              'rounded-[20px]',
            )}
          >
            <div className="text-[#40B7BA]">Admin</div>
          </div>

          <div>
            <div className="flex-col absolute right-0 mt-2 w-full origin-top-right divide-x divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none flex">
              <div className="px-1 py-1 w-full">
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
                            optionName: 'Admin Leaderboard',
                            onClick: () => router.push('/admin/leaderboard'),
                          },
                          {
                            optionName: 'Decision Control',
                            onClick: () => router.push('/admin/decisions'),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>

              <div className="w-full px-1 py-1">
                <AdminNavbarColumn
                  sectionTitle="Workshops + Tavern"
                  options={scanList
                    .filter(
                      (scan) =>
                        scan.name.toLowerCase().includes('workshop') ||
                        scan.name.toLowerCase().includes('ramen') ||
                        scan.name.toLowerCase().includes('tavern'),
                    )
                    .map((scan) => ({
                      optionName: scan.name,
                      onClick: () => setCurrentScan(scan),
                    }))}
                />
              </div>

              <div className="px-1 py-1">
                <AdminNavbarColumn
                  sectionTitle="Everything Else"
                  options={scanList
                    .filter(
                      (scan) =>
                        !scan.name.toLowerCase().includes('workshop') &&
                        !scan.name.toLowerCase().includes('ramen') &&
                        !scan.name.toLowerCase().includes('tavern'),
                    )
                    .map((scan) => ({
                      optionName: scan.name,
                      onClick: () => setCurrentScan(scan),
                    }))}
                />
              </div>
            </div>
          </div>
        </Menu>,
      );
      itemIdx++;
    }

    return items;
  };

  return (
    <div className="flex justify-center py-2 w-full">
      <div
        id="nav-bar"
        className="relative font-dmSans border-[3px] border-[rgba(30,30,30,0.60)] rounded-xl p-1 bg-white opacity-100 text-[#40B7BA] cursor-pointer w-[80%]"
      >
        <FloatingDockWrapper
          classes={{
            wrapperDiv: clsx('gap-4 flex items-center justify-center flex-wrap'),
          }}
          items={mainDockItems()}
        />

        <QRScanDialog scan={currentScan} onModalClose={() => setCurrentScan(null)} />
      </div>
    </div>
  );
}
