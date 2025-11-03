import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { GroupLeaderboardData } from '../pages/api/group-leaderboard';

const GROUP_COLORS = {
  Bird: 'from-orange-400 to-yellow-500',
  Cat: 'from-gray-700 to-gray-900',
  Deer: 'from-amber-600 to-yellow-700',
  Fox: 'from-orange-600 to-red-700',
};

const GROUP_MASCOTS = {
  Bird: '/assets/ab-bird.webp',
  Cat: '/assets/ab-cat.webp',
  Deer: '/assets/ab-deer.webp',
  Fox: '/assets/ab-fox.webp',
};

export default function GroupLeaderboardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    leaderboard: GroupLeaderboardData[];
    totalUsers: number;
    lastUpdated: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/group-leaderboard');
      const newData = await response.json();
      console.log('Leaderboard data fetched:', newData);
      setData(newData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-[1001] bg-[#2D5016] hover:bg-[#7A9E7E] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Open Group Leaderboard"
      >
        <Trophy className="w-8 h-8" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto font-youngSerif"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#2D5016] p-3 sm:p-4 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-youngSerif font-bold text-white">
                    Group Leaderboard
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80">Ranked by average points</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-3 min-h-[300px]" style={{ backgroundColor: '#f9fafb' }}>
              {isLoading && !data ? (
                <div className="text-center py-8" style={{ color: '#2D5016' }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
                  <p className="text-sm font-youngSerif" style={{ color: '#2D5016' }}>
                    Loading leaderboard...
                  </p>
                </div>
              ) : data && data.leaderboard && data.leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {data.leaderboard.map((group, index) => {
                    const gradientMap = {
                      Bird: 'linear-gradient(to right, #fb923c, #eab308)',
                      Cat: 'linear-gradient(to right, #374151, #111827)',
                      Deer: 'linear-gradient(to right, #d97706, #a16207)',
                      Fox: 'linear-gradient(to right, #ea580c, #b91c1c)',
                    };

                    return (
                      <div
                        key={group.group}
                        className={`rounded-lg overflow-hidden ${
                          index === 0 ? 'ring-4 ring-yellow-400' : ''
                        }`}
                        style={{
                          background: gradientMap[group.group],
                          minHeight: '110px',
                        }}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 flex-shrink-0">
                                <img
                                  src={GROUP_MASCOTS[group.group]}
                                  alt={`${group.group} mascot`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <h3
                                className="text-xl sm:text-2xl font-youngSerif font-bold text-white"
                                style={{ color: '#ffffff' }}
                              >
                                {group.group}
                              </h3>
                            </div>

                            <div className="bg-white text-[#2D5016] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center shadow-lg font-youngSerif border border-black flex-shrink-0">
                              #{index + 1}
                            </div>
                          </div>

                          <div
                            className="flex items-center justify-center rounded-lg py-2 px-3"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                          >
                            <div className="text-center">
                              <div
                                className="text-2xl sm:text-3xl font-youngSerif font-bold text-white leading-tight"
                                style={{ color: '#ffffff' }}
                              >
                                {group.averagePoints}
                              </div>
                              <div
                                className="text-xs font-youngSerif mt-1"
                                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                              >
                                avg pts per hacker
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm font-youngSerif mb-2" style={{ color: '#2D5016' }}>
                    {!data ? 'No data available' : 'No groups found'}
                  </p>
                  <button
                    onClick={fetchLeaderboard}
                    className="px-4 py-2 rounded-lg font-youngSerif text-sm"
                    style={{ backgroundColor: '#2D5016', color: '#ffffff' }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
