import FaqCore from './FaqCore';

interface Props {
  answeredQuestions: AnsweredQuestion[];
}

export default function HomeFaq({ answeredQuestions }: Props) {
  return (
    answeredQuestions.length != 0 && (
      <section
        style={{
          position: 'relative',
        }}
      >
        <style jsx>{`
          @keyframes fireflyFloat1 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -30px) scale(1.2);
            }
            50% {
              transform: translate(-15px, -20px) scale(0.8);
            }
            75% {
              transform: translate(30px, 10px) scale(1.1);
            }
          }
          @keyframes fireflyFloat2 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            20% {
              transform: translate(-25px, 15px) scale(0.9);
            }
            40% {
              transform: translate(35px, -25px) scale(1.3);
            }
            60% {
              transform: translate(-10px, 30px) scale(0.7);
            }
            80% {
              transform: translate(20px, -10px) scale(1.1);
            }
          }
          @keyframes fireflyFloat3 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            30% {
              transform: translate(40px, 20px) scale(1.4);
            }
            60% {
              transform: translate(-30px, -15px) scale(0.6);
            }
            90% {
              transform: translate(15px, 25px) scale(1.2);
            }
          }
          @keyframes fireflyFloat4 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            15% {
              transform: translate(-20px, -35px) scale(0.8);
            }
            35% {
              transform: translate(25px, 10px) scale(1.5);
            }
            55% {
              transform: translate(-35px, 20px) scale(0.9);
            }
            75% {
              transform: translate(10px, -20px) scale(1.3);
            }
            95% {
              transform: translate(-15px, 15px) scale(0.7);
            }
          }
          @keyframes fireflyGlow {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
        `}</style>
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-200px',
            left: 0,
            right: 0,
            height: 'calc(100% + 200px)',
            zIndex: 20,
          }}
        >
          {[...Array(16)].map((_, i) => {
            const animationType = i % 4;
            const animationNames = [
              'fireflyFloat1',
              'fireflyFloat2',
              'fireflyFloat3',
              'fireflyFloat4',
            ];
            const selectedAnimation = animationNames[animationType];

            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 6}s`,
                  boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24',
                  animation: `${selectedAnimation} ${
                    6 + Math.random() * 6
                  }s ease-in-out infinite, fireflyGlow ${
                    2 + Math.random() * 3
                  }s ease-in-out infinite`,
                }}
              >
                <div
                  className="absolute inset-0 bg-yellow-300 rounded-full"
                  style={{
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1.5 + Math.random() * 2.5}s`,
                    animation: 'fireflyGlow 2s ease-in-out infinite',
                  }}
                />
              </div>
            );
          })}
        </div>
        <FaqCore fetchedFaqs={answeredQuestions}></FaqCore>
      </section>
    )
  );
}
