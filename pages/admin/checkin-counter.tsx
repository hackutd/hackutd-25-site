import Head from 'next/head';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { checkUserPermission } from '@/lib/util';
import { useAuthContext } from '@/lib/user/AuthContext';
import { RequestHelper } from '@/lib/request-helper';

const allowedRoles = ['admin', 'super_admin', 'organizer'];

interface CheckInStats {
  totalRegistrations: number;
  checkedInCount: number;
  percentageCheckedIn: number;
  lastUpdated: string;
}

export default function CheckInCounterPage() {
  const { user, isSignedIn } = useAuthContext();
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds

  const fetchCheckInStats = async () => {
    try {
      const response = await RequestHelper.get('/api/checkin-stats', {
        headers: {
          Authorization: user.token,
        },
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch check-in stats');
      console.error('Error fetching check-in stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isSignedIn && user?.token) {
      fetchCheckInStats();
    }
  }, [isSignedIn, user?.token]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isSignedIn) return;

    const interval = setInterval(() => {
      fetchCheckInStats();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isSignedIn]);

  if (!isSignedIn || !checkUserPermission(user, allowedRoles)) {
    return <div className="text-2xl font-black text-center">Unauthorized</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Head>
        <title>HackUTD 2025 - Check-In Counter</title>
        <meta name="description" content="Real-time Check-In Counter" />
      </Head>

      <div className="max-w-4xl w-full">
        {/* Main Counter Display */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Check-In Counter</h1>

          {loading && !stats ? (
            <div className="text-center py-12">
              <div className="text-2xl text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-xl text-red-600 mb-4">Error: {error}</div>
              <button
                onClick={fetchCheckInStats}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : stats ? (
            <>
              {/* Big Counter - Just the number */}
              <div className="text-center mb-8">
                <div className="text-9xl font-bold text-blue-600 mb-4">{stats.checkedInCount}</div>
                <div className="text-2xl text-gray-500">People Checked In</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${stats.percentageCheckedIn}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {stats.percentageCheckedIn.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center mt-6 text-sm text-gray-500">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </div>
            </>
          ) : null}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col gap-4">
            {/* Auto-refresh Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium">Auto-refresh</span>
              </label>

              {autoRefresh && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Every</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={5}>5 sec</option>
                    <option value={10}>10 sec</option>
                    <option value={30}>30 sec</option>
                    <option value={60}>1 min</option>
                  </select>
                </div>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={fetchCheckInStats}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Prevent static generation for admin pages
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
