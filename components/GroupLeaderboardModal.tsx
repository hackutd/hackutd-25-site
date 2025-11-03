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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-[1001] bg-[#2D5016] hover:bg-[#7A9E7E] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Open Group Leaderboard"
      >
        <Trophy className="w-8 h-8" strokeWidth={2.5} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto font-youngSerif"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#2D5016] p-4 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-youngSerif font-bold text-white">
                    Group Leaderboard
                  </h2>
                  <p className="text-sm text-white/80">Ranked by average points</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {isLoading && !data ? (
                <div className="text-center text-[#2D5016] py-8">
                  <p className="text-sm">Loading...</p>
                </div>
              ) : data ? (
                <div className="space-y-2">
                  {data.leaderboard.map((group, index) => (
                    <div
                      key={group.group}
                      className={`relative bg-gradient-to-r ${
                        GROUP_COLORS[group.group]
                      } rounded-lg overflow-hidden ${index === 0 ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                      {/* Rank Badge */}
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
                        <div className="bg-white text-[#2D5016] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center shadow-lg font-youngSerif border border-black">
                          #{index + 1}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 pr-16">
                        {/* Group Name with Mascot */}
                        <div className="flex items-center gap-3 h-full">
                          <div className="w-12 h-12 flex-shrink-0">
                            <img
                              src={GROUP_MASCOTS[group.group]}
                              alt={`${group.group} mascot`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="text-2xl font-youngSerif font-bold text-white">
                            {group.group}
                          </h3>
                        </div>

                        {/* Points */}
                        <div className="flex flex-col items-end justify-center">
                          <div className="text-3xl font-youngSerif font-bold text-white leading-tight">
                            {group.averagePoints}
                          </div>
                          <div className="text-xs text-white/80 font-youngSerif">
                            avg pts per hacker
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#2D5016] py-8">
                  <p className="text-sm">Failed to load leaderboard</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
