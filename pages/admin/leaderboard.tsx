import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/user/AuthContext';
import { RequestHelper } from '@/lib/request-helper';
import { checkUserPermission } from '@/lib/util';
import Loading from '@/components/icon/Loading';

interface AdminReviewStats {
  adminId: string;
  adminName: string;
  totalReviews: number;
  accepts: number;
  rejects: number;
  maybes: number;
  superVotes: number;
  acceptanceRate: number;
  rejectionRate: number;
  maybeRate: number;
}

interface LeaderboardResponse {
  adminStats: AdminReviewStats[];
  totalApplications: number;
  judgedApplications: number;
}

const allowedRoles = ['super_admin'];

export default function AdminLeaderboardPage() {
  const { user, isSignedIn } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse>({
    adminStats: [],
    totalApplications: 0,
    judgedApplications: 0,
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { data } = await RequestHelper.get<LeaderboardResponse>('/api/admin-leaderboard', {
          headers: {
            Authorization: user.token,
          },
        });
        setLeaderboardData(data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      fetchLeaderboardData();
    }
  }, [isSignedIn, user]);

  if (!isSignedIn || !checkUserPermission(user, allowedRoles)) {
    return <div className="text-2xl font-black text-center bg-blue-200">Unauthorized</div>;
  }

  if (loading) {
    return <Loading width={48} height={48} />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Leaderboard - HackUTD</title>
      </Head>

      <div className="min-h-screen bg-[#F2F3FF]">
        <div className="w-full max-w-screen-2xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#5D5A88] mb-2">Admin Review Leaderboard</h1>
            <p className="text-[#5D5A88] text-lg">
              Track review performance and statistics for all admins
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-[#5D5A88]">
                {leaderboardData.adminStats.length}
              </div>
              <div className="text-gray-600">Total Admins</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-purple-600">
                {leaderboardData.totalApplications}
              </div>
              <div className="text-gray-600">Total Applications</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-indigo-600">
                {leaderboardData.judgedApplications}
              </div>
              <div className="text-gray-600">Applications Judged (at least once)</div>
              <div className="text-sm text-gray-500 mt-1">
                {leaderboardData.totalApplications > 0
                  ? `${Math.round(
                      (leaderboardData.judgedApplications / leaderboardData.totalApplications) *
                        100,
                    )}% complete`
                  : '0% complete'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-green-600">
                {leaderboardData.adminStats.reduce((sum, admin) => sum + admin.totalReviews, 0)}
              </div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-blue-600">
                {leaderboardData.adminStats.reduce((sum, admin) => sum + admin.accepts, 0)}
              </div>
              <div className="text-gray-600">Total Accepts</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-red-600">
                {leaderboardData.adminStats.reduce((sum, admin) => sum + admin.rejects, 0)}
              </div>
              <div className="text-gray-600">Total Rejects</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl font-bold text-yellow-600">
                {leaderboardData.adminStats.reduce((sum, admin) => sum + admin.maybes, 0)}
              </div>
              <div className="text-gray-600">Total Maybes</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#5D5A88] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left font-semibold">Admin Name</th>
                    <th className="px-6 py-4 text-center font-semibold">Total Reviews</th>
                    <th className="px-6 py-4 text-center font-semibold">Accepts</th>
                    <th className="px-6 py-4 text-center font-semibold">Rejects</th>
                    <th className="px-6 py-4 text-center font-semibold">Maybes</th>
                    <th className="px-6 py-4 text-center font-semibold">Super Votes</th>
                    <th className="px-6 py-4 text-center font-semibold">Accept Rate</th>
                    <th className="px-6 py-4 text-center font-semibold">Reject Rate</th>
                    <th className="px-6 py-4 text-center font-semibold">Maybe Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboardData.adminStats.map((admin, index) => (
                    <tr key={admin.adminId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-yellow-500 mr-2">🥇</span>}
                          {index === 1 && <span className="text-gray-400 mr-2">🥈</span>}
                          {index === 2 && <span className="text-orange-500 mr-2">🥉</span>}
                          <span className="font-semibold text-[#5D5A88]">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#5D5A88]">{admin.adminName}</td>
                      <td className="px-6 py-4 text-center font-semibold text-blue-600">
                        {admin.totalReviews}
                      </td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">
                        {admin.accepts}
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 font-medium">
                        {admin.rejects}
                      </td>
                      <td className="px-6 py-4 text-center text-yellow-600 font-medium">
                        {admin.maybes}
                      </td>
                      <td className="px-6 py-4 text-center text-purple-600 font-medium">
                        {admin.superVotes}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {admin.acceptanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                          {admin.rejectionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                          {admin.maybeRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-[#5D5A88] mb-3">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Accepts:</span> Applications scored as 4 (Strong
                Accept)
              </div>
              <div>
                <span className="font-medium">Rejects:</span> Applications scored as 1 (Strong
                Reject)
              </div>
              <div>
                <span className="font-medium">Maybes:</span> Applications scored as 2 or 3 (Maybe
                No/Yes)
              </div>
              <div>
                <span className="font-medium">Super Votes:</span> Reviews with 50x weight (super
                admin mode)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
