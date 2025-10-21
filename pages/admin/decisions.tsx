import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/user/AuthContext';
import { RequestHelper } from '@/lib/request-helper';
import { checkUserPermission } from '@/lib/util';
import Loading from '@/components/icon/Loading';

const allowedRoles = ['super_admin'];

export default function DecisionControlPage() {
  const { user, isSignedIn } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [decisionsRevealed, setDecisionsRevealed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDecisionStatus = async () => {
      try {
        const { data } = await RequestHelper.get<{ applicationDecisions: boolean }>(
          '/api/decisions/status',
          {
            headers: {
              Authorization: user.token,
            },
          },
        );
        setDecisionsRevealed(data.applicationDecisions);
      } catch (err) {
        console.error('Error fetching decision status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      fetchDecisionStatus();
    }
  }, [isSignedIn, user]);

  const toggleDecisions = async (reveal: boolean) => {
    setUpdating(true);
    setMessage('');
    try {
      const { data } = await RequestHelper.post<{ applicationDecisions: boolean }, { msg: string }>(
        '/api/decisions/toggle',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: user.token,
          },
        },
        {
          applicationDecisions: reveal,
        },
      );
      setDecisionsRevealed(reveal);
      setMessage(data.msg);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling decisions:', err);
      setMessage('Failed to update decision visibility');
    } finally {
      setUpdating(false);
    }
  };

  if (!isSignedIn || !checkUserPermission(user, allowedRoles)) {
    return <div className="text-2xl font-black text-center bg-blue-200">Unauthorized</div>;
  }

  if (loading) {
    return <Loading width={48} height={48} />;
  }

  return (
    <>
      <Head>
        <title>Decision Control - HackUTD</title>
      </Head>

      <div className="min-h-screen bg-[#F2F3FF]">
        <div className="w-full max-w-screen-xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#5D5A88] mb-2">Application Decision Control</h1>
            <p className="text-[#5D5A88] text-lg">
              Control when applicants can see their acceptance/rejection status
            </p>
          </div>

          {/* Current Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Status</h2>
                <p className="text-gray-600">
                  Decisions are currently{' '}
                  <span
                    className={`font-bold ${decisionsRevealed ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {decisionsRevealed ? 'VISIBLE' : 'HIDDEN'}
                  </span>{' '}
                  to applicants
                </p>
              </div>
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  decisionsRevealed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {decisionsRevealed ? (
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> Once decisions are revealed, applicants will
                    immediately see their acceptance/rejection status. Make sure all reviews are
                    complete before revealing decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-blue-800">{message}</p>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => toggleDecisions(true)}
                disabled={updating || decisionsRevealed}
                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white transition-all ${
                  decisionsRevealed
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                } ${updating ? 'opacity-50 cursor-wait' : ''}`}
              >
                {updating && !decisionsRevealed ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Revealing...
                  </span>
                ) : (
                  '✓ Reveal Decisions to Applicants'
                )}
              </button>

              <button
                onClick={() => toggleDecisions(false)}
                disabled={updating || !decisionsRevealed}
                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white transition-all ${
                  !decisionsRevealed
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 active:scale-95'
                } ${updating ? 'opacity-50 cursor-wait' : ''}`}
              >
                {updating && decisionsRevealed ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Hiding...
                  </span>
                ) : (
                  '✕ Hide Decisions from Applicants'
                )}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How Decisions Work</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  <strong>Accepted:</strong> Applications with a score of 2 or higher (sum of all
                  review scores)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Rejected:</strong> Applications with a score below 2
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  <strong>In Review:</strong> Applications show this status when decisions are
                  hidden
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>
                  <strong>Super Votes:</strong> Count as 50x multiplier (instant accept/reject)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
