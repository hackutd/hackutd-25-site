import React from 'react';

interface PointsCardProps {
  points: number;
  scans?: Array<{
    name: string;
    timestamp: string;
    netPoints?: number;
  }>;
}

export default function PointsCard({ points, scans = [] }: PointsCardProps) {
  const totalScans = scans.length;

  // Calculate points earned and spent
  const totalPointsEarned = scans
    .filter((scan) => (scan.netPoints || 0) > 0)
    .reduce((sum, scan) => sum + (scan.netPoints || 0), 0);
  const totalPointsSpent = Math.abs(
    scans
      .filter((scan) => (scan.netPoints || 0) < 0)
      .reduce((sum, scan) => sum + (scan.netPoints || 0), 0),
  );

  // Alternative calculation if netPoints is not available
  // This would be the difference between current points and what was spent
  const alternativePointsEarned = points + totalPointsSpent;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Points</h2>
        <div className="text-4xl font-bold text-blue-600">{points}</div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {totalPointsEarned || alternativePointsEarned}
          </div>
          <div className="text-sm text-green-700">Total Points Earned</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600">{totalPointsSpent}</div>
          <div className="text-sm text-red-700">Points Spent</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{totalScans}</div>
          <div className="text-sm text-blue-700">Total Scans</div>
        </div>
      </div>

      {scans.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
          <div className="max-h-32 overflow-y-auto">
            {scans
              .slice(-5)
              .reverse()
              .map((scan, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm text-gray-700">{scan.name}</div>
                  <div
                    className={`text-sm font-medium ${
                      (scan.netPoints || 0) > 0
                        ? 'text-green-600'
                        : (scan.netPoints || 0) < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {(scan.netPoints || 0) > 0 ? '+' : ''}
                    {scan.netPoints || 0}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
