import { useState } from 'react';

interface MLHAgreementDialogProps {
  userName: string;
  userId: string;
  userToken: string;
  onAgree: () => void;
  onCancel: () => void;
  isWalkIn?: boolean;
}

export default function MLHAgreementDialog({
  userName,
  userId,
  userToken,
  onAgree,
  onCancel,
  isWalkIn = false,
}: MLHAgreementDialogProps) {
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgree = async () => {
    setIsAgreeing(true);
    setError(null);

    try {
      const response = await fetch('/api/mlh-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userToken,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to record agreement');
      }

      // Wait a moment to show success
      setTimeout(() => {
        onAgree();
      }, 500);
    } catch (err) {
      console.error('Error recording MLH agreement:', err);
      setError('Failed to record agreement. Please try again.');
      setIsAgreeing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">MLH Privacy Policy Agreement</h2>
              <p className="text-sm text-gray-600 mt-1">Required for {userName}</p>
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
              REQUIRED
            </div>
          </div>

          {/* Airplane seat metaphor */}
          <div
            className={`border-l-4 p-4 mb-4 ${
              isWalkIn ? 'bg-orange-50 border-orange-400' : 'bg-blue-50 border-blue-400'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">{isWalkIn ? '⏰' : '✈️'}</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${isWalkIn ? 'text-orange-800' : 'text-blue-800'}`}>
                  <strong>
                    {isWalkIn ? 'Late Check-In Participant:' : 'Like airplane emergency seats:'}
                  </strong>{' '}
                  This event is a Major League Hacking (MLH) member event. You must agree to the MLH
                  Privacy Policy to participate
                  {isWalkIn ? ' before being scanned for event activities' : ''}.
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          {!showTerms ? (
            <>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What you&apos;re agreeing to:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>
                        I authorize MLH to share my application/registration information with event
                        organizers, sponsors, and recruiters for employment opportunities.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>
                        I authorize MLH to send me occasional emails about relevant events,
                        opportunities, and activities.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>
                        I have read and agree to the{' '}
                        <a
                          href="https://mlh.io/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          MLH Privacy Policy
                        </a>
                        .
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Read full MLH Privacy Policy →
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAgree}
                  disabled={isAgreeing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAgreeing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Recording Agreement...
                    </span>
                  ) : (
                    '✓ I Agree - Proceed with Check-In'
                  )}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isAgreeing}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Check-In
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                This agreement will be recorded with a timestamp.
              </p>
            </>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">MLH Privacy Policy</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    This is a Major League Hacking (MLH) member event. By participating, you agree
                    to the terms of both the{' '}
                    <a
                      href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      MLH Code of Conduct
                    </a>{' '}
                    and the{' '}
                    <a
                      href="https://mlh.io/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      MLH Privacy Policy
                    </a>
                    .
                  </p>
                  <p>
                    MLH is committed to transparency regarding the data we collect. We use the data
                    we collect to improve your experience at member events and to provide you with
                    opportunities from our partners.
                  </p>
                  <p>
                    <strong>View the full policy:</strong>{' '}
                    <a
                      href="https://mlh.io/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      https://mlh.io/privacy
                    </a>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                ← Back to Agreement
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
