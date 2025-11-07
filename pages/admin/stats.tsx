import Head from 'next/head';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RestaurantIcon from '@mui/icons-material/Restaurant';

import { checkUserPermission } from '@/lib/util';
import { RequestHelper } from '@/lib/request-helper';
import { fieldToName } from '@/lib/stats/field';
import { useAuthContext } from '@/lib/user/AuthContext';

import AdminStatsCard from '@/components/admin/AdminStatsCard';
import NivoPieChart from '@/components/admin/NivoPieChart';
import NivoBarChart from '@/components/admin/NivoBarChart';
import Loading from '@/components/icon/Loading';

const allowedRoles = ['super_admin'];

interface TopHacker {
  name: string;
  email: string;
  points: number;
}

interface GroupLeaderboardData {
  group: string;
  totalPoints: number;
  memberCount: number;
  averagePoints: number;
  topMembers: TopHacker[];
}

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const { user, isSignedIn } = useAuthContext();
  const [statsData, setStatsData] = useState<GeneralStats>();
  const [allCandidatesStats, setAllCandidatesStats] = useState<GeneralStats>();
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardData[]>([]);

  useEffect(() => {
    async function getData() {
      try {
        const [statsResponse, allCandidatesResponse, leaderboardResponse] = await Promise.all([
          RequestHelper.get<GeneralStats & { timestamp: any }>('/api/stats', {
            headers: {
              Authorization: user.token,
            },
          }),
          RequestHelper.get<GeneralStats & { timestamp: any }>('/api/stats-all-candidates', {
            headers: {
              Authorization: user.token,
            },
          }),
          fetch('/api/group-leaderboard').then((res) => res.json()),
        ]);

        console.log('Leaderboard response:', leaderboardResponse);

        setStatsData(statsResponse.data);
        setAllCandidatesStats(allCandidatesResponse.data);
        setGroupLeaderboard(leaderboardResponse.leaderboard || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    }
    if (user?.token) {
      getData();
    }
  }, [user?.token]);

  if (!isSignedIn || !checkUserPermission(user, allowedRoles)) {
    return <div className="text-2xl font-black text-center">Unauthorized</div>;
  }

  if (loading) {
    return <Loading width={200} height={200} />;
  }

  return (
    <div className="flex flex-col flex-grow bg-white min-h-screen">
      <Head>
        <title>HackUTD 2024 - Admin</title>
        <meta name="description" content="HackPortal's Admin Page" />
      </Head>
      {/* <AdminHeader /> */}
      <div className="w-full xl:w-3/5 mx-auto p-6 flex flex-col gap-y-6">
        <div className="flex-col gap-y-3 w-full md:flex-row flex justify-around gap-x-2">
          <AdminStatsCard
            icon={<CheckIcon />}
            title="Check-Ins"
            value={allCandidatesStats.checkedInCount}
          />
          <AdminStatsCard
            icon={<AccountCircleIcon />}
            title="Hackers"
            value={allCandidatesStats.hackerCount}
          />
          <AdminStatsCard
            icon={<SupervisorAccountIcon />}
            title="Admins"
            value={allCandidatesStats.adminCount}
          />
          <AdminStatsCard
            icon={<EngineeringIcon />}
            title="Super Admin"
            value={allCandidatesStats.superAdminCount}
          />
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-md p-6 border-2 border-yellow-400">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Top 5 Hackers Per Group</h2>
          </div>
          {groupLeaderboard && groupLeaderboard.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupLeaderboard.map((group) => (
                <div key={group.group} className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>Team {group.group}</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({group.memberCount} members)
                    </span>
                  </h3>
                  {group.topMembers && group.topMembers.length > 0 ? (
                    <div className="space-y-2">
                      {group.topMembers.map((hacker, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 w-6">#{idx + 1}</span>
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                              {hacker.name || hacker.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-[#2D5016]">
                              {hacker.points}
                            </span>
                            <span className="text-xs text-gray-500">pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No members yet</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              <p>No checked-in hackers with points yet.</p>
              <p className="text-sm text-gray-500 mt-1">Check console for debug info.</p>
            </div>
          )}
        </div>

        {allCandidatesStats &&
          allCandidatesStats.scans &&
          Object.keys(allCandidatesStats.scans).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Scan Type Counts</h2>
              </div>
              <NivoBarChart
                name="Scan Counts"
                items={Object.entries(allCandidatesStats.scans)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([scanType, count]) => ({
                    itemName: scanType,
                    itemValue: count.toString(),
                  }))}
              />
            </div>
          )}

        {allCandidatesStats && allCandidatesStats.dietary && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <RestaurantIcon className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Dietary Restrictions - All Candidates
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dietary Restriction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(allCandidatesStats.dietary)
                    .sort(([, a], [, b]) => b - a)
                    .map(([restriction, count]) => {
                      const total = Object.values(allCandidatesStats.dietary).reduce(
                        (sum, val) => sum + val,
                        0,
                      );
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={restriction} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {restriction || 'None specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <strong>Total candidates:</strong>{' '}
              {Object.values(allCandidatesStats.dietary).reduce((sum, val) => sum + val, 0)}
            </div>
          </div>
        )}
        {Object.entries(statsData)
          .filter(([k, v]) => typeof v === 'object')
          .map(([key, value]) => {
            if (Object.keys(value).length <= 6)
              return (
                <NivoPieChart
                  key={key}
                  name={fieldToName[key]}
                  items={Object.entries(statsData[key] as Record<any, any>)
                    .sort((a, b) => {
                      const aMonth = parseInt(a[0].substring(0, a[0].indexOf('-')));
                      const aDate = parseInt(a[0].substring(a[0].indexOf('-') + 1));

                      const bMonth = parseInt(b[0].substring(0, b[0].indexOf('-')));
                      const bDate = parseInt(b[0].substring(b[0].indexOf('-') + 1));

                      if (aMonth != bMonth) return aMonth - bMonth;
                      return aDate - bDate;
                    })
                    .map(([k, v]) => ({
                      id: k,
                      value: v,
                    }))}
                />
              );
            return (
              <NivoBarChart
                key={key}
                name={fieldToName[key]}
                items={Object.entries(statsData[key] as Record<any, any>)
                  .sort((a, b) => {
                    const aMonth = parseInt(a[0].substring(0, a[0].indexOf('-')));
                    const aDate = parseInt(a[0].substring(a[0].indexOf('-') + 1));

                    const bMonth = parseInt(b[0].substring(0, b[0].indexOf('-')));
                    const bDate = parseInt(b[0].substring(b[0].indexOf('-') + 1));

                    if (aMonth != bMonth) return bMonth - aMonth;
                    return bDate - aDate;
                  })
                  .map(([k, v]) => ({
                    itemName: k,
                    itemValue: v,
                  }))}
              />
            );
          })}
      </div>
    </div>
  );
}
