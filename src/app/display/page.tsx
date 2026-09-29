"use client";

import { useEffect, useRef, useState } from "react";

type House = {
  houseId: string;
  houseName: string;
  houseCode: string;
  color: string;
  totalPoints: number;
  rank: number;
  categoryScores: {
    SSR: number;
    SR: number;
    JR: number;
    SJR: number;
    GN: number;
  };
};

type PublishedResult = {
  id: string;
  programId: string;
  participantId: string;
  totalMark: number;
  rank: number;
  points: number;
  status: string;
  approvedAt: string | null;
  program: {
    id: string;
    code: string;
    name: string;
    category: {
      code: string;
      name: string;
    };
  };
  participant: {
    id: string;
    name: string;
    chestNo: number;
  };
  house: {
    id: string;
    name: string;
    code: string;
    color: string;
  };
};

const screens = [
  { name: "OVERALL", code: "OVERALL" },
  { name: "SUPER SENIOR", code: "SSR" },
  { name: "SENIOR", code: "SR" },
  { name: "JUNIOR", code: "JR" },
  { name: "SUB JUNIOR", code: "SJR" },
  { name: "GENERAL", code: "GN" },
];

const houseColors: Record<string, string> = {
  Blue: "#2563eb",
  Red: "#dc2626",
  Green: "#16a34a",
};

const LATEST_RESULT_KEY = "kalarge_latest_published_result";

function ExhibitionBackground() {
  return (
    <div className="exhibition-bg" aria-hidden="true">
      <div className="art-glow" />
      <div className="art-shape art-shape-blue" />
      <div className="art-shape art-shape-green" />
      <div className="art-shape art-shape-red" />
      <div className="art-shape art-shape-gold" />
      <div className="art-grain" />
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-5 py-3">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.9)]" />
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-green-400">
        Live
      </span>
    </div>
  );
}

function EventHeader() {
  return (
    <header className="relative z-10 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 sm:text-sm sm:tracking-[0.45em]">
          Ahlul Quran Students Association
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-[-0.06em] sm:text-6xl lg:text-8xl">
          KALARGE
        </h1>
        <p className="mt-1 text-sm font-bold tracking-[0.5em] text-white/40 sm:text-xl">
          ARTS FEST 2K26
        </p>
      </div>
      <LiveBadge />
    </header>
  );
}

function DisplayFooter({
  left,
  center,
  right,
}: {
  left: string;
  center: string;
  right: string;
}) {
  return (
    <footer className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 sm:text-xs sm:tracking-[0.3em]">
        {left}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 sm:text-xs sm:tracking-[0.3em]">
        {center}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 sm:text-xs sm:tracking-[0.3em]">
        {right}
      </p>
    </footer>
  );
}

function RankLabel({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇 1ST</span>;
  if (rank === 2) return <span>🥈 2ND</span>;
  if (rank === 3) return <span>🥉 3RD</span>;
  return <span>RANK {rank}</span>;
}

export default function DisplayPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [screenIndex, setScreenIndex] = useState(0);
  const [latestResult, setLatestResult] = useState<PublishedResult[] | null>(
    null
  );
  const [showLatestResult, setShowLatestResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // Browser timer IDs are numbers.
  const resultTimer = useRef<number | null>(null);

  async function loadDisplayData() {
    try {
      const scoreboardResponse = await fetch("/api/scoreboard", {
        cache: "no-store",
      });

      if (!scoreboardResponse.ok) {
        throw new Error("Could not load scoreboard");
      }

      const scoreboardData = await scoreboardResponse.json();

      if (scoreboardData.success) {
        setHouses(scoreboardData.scoreboard ?? []);
      }

      const resultsResponse = await fetch("/api/public/results", {
        cache: "no-store",
      });

      if (!resultsResponse.ok) {
        throw new Error("Could not load published results");
      }

      const resultsData = await resultsResponse.json();

      if (!resultsData.success || !resultsData.results?.length) {
        return;
      }

      const approvedResults: PublishedResult[] =
        resultsData.results.filter(
          (result: PublishedResult) =>
            result.status === "APPROVED" && result.approvedAt
        );

      if (!approvedResults.length) return;

      const latestApprovedAt = Math.max(
        ...approvedResults.map((result) =>
          new Date(result.approvedAt as string).getTime()
        )
      );

      const latestResultRecord = approvedResults.find(
        (result) =>
          new Date(result.approvedAt as string).getTime() ===
          latestApprovedAt
      );

      if (!latestResultRecord) return;

      const latestProgramId = latestResultRecord.programId;

      const latestProgramResults = approvedResults
        .filter((result) => result.programId === latestProgramId)
        .sort((a, b) => a.rank - b.rank);

      if (!latestProgramResults.length) return;

      const publicationKey = `${latestProgramId}-${latestApprovedAt}`;
      const previousPublication = localStorage.getItem(LATEST_RESULT_KEY);

      // On first load, remember the current result without replaying it.
      if (!previousPublication) {
        localStorage.setItem(LATEST_RESULT_KEY, publicationKey);
        return;
      }

      // Do not replay a result that has already been displayed.
      if (previousPublication === publicationKey) return;

      localStorage.setItem(LATEST_RESULT_KEY, publicationKey);
      setLatestResult(latestProgramResults);
      setShowLatestResult(true);

      // Show the latest result for nine seconds.
      if (resultTimer.current !== null) {
        window.clearTimeout(resultTimer.current);
      }

      resultTimer.current = window.setTimeout(() => {
        setShowLatestResult(false);
        setLatestResult(null);
        resultTimer.current = null;
      }, 9000);
    } catch (error) {
      console.error("DISPLAY ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // Refresh scoreboard and approved results every 10 seconds.
  useEffect(() => {
    void loadDisplayData();

    const refresh = window.setInterval(() => {
      void loadDisplayData();
    }, 10000);

    return () => {
      window.clearInterval(refresh);

      if (resultTimer.current !== null) {
        window.clearTimeout(resultTimer.current);
        resultTimer.current = null;
      }
    };
  }, []);

  // Rotate through the six scoreboard screens every 15 seconds.
  useEffect(() => {
    const rotation = window.setInterval(() => {
      setScreenIndex((current) => (current + 1) % screens.length);
    }, 15000);

    return () => window.clearInterval(rotation);
  }, []);

  const currentScreen = screens[screenIndex];

  function getPoints(house: House) {
    if (currentScreen.code === "OVERALL") {
      return house.totalPoints;
    }

    return (
      house.categoryScores?.[
        currentScreen.code as keyof House["categoryScores"]
      ] ?? 0
    );
  }

  const rankedHouses = [...houses].sort(
    (a, b) => getPoints(b) - getPoints(a)
  );

  // Latest approved programme result.
  if (showLatestResult && latestResult && latestResult.length > 0) {
    const program = latestResult[0].program;

    const rankGroups = [1, 2, 3].map((rank) => ({
      rank,
      participants: latestResult.filter((result) => result.rank === rank),
    }));

    return (
      <main className="relative min-h-screen overflow-hidden bg-[#030407] text-white">
        <ExhibitionBackground />

        <div className="relative z-10 flex min-h-screen flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
          <EventHeader />

          <section className="relative z-10 mt-10 text-center sm:mt-12 lg:mt-16">
            <p className="result-title text-xs font-bold uppercase tracking-[0.35em] text-white/40 sm:text-sm sm:tracking-[0.5em]">
              Latest Published Result
            </p>

            <h2 className="result-program mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-6xl">
              {program.name}
            </h2>

            <p className="result-category mt-3 text-sm font-bold uppercase tracking-[0.3em] text-white/40 sm:text-lg">
              {program.category.code}
            </p>

            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white/40" />
          </section>

          <section className="relative z-10 mx-auto mt-10 w-full max-w-6xl flex-1 sm:mt-12">
            <div className="space-y-8">
              {rankGroups.map(({ rank, participants }) => {
                if (!participants.length) return null;

                return (
                  <div key={rank} className="rank-group">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white sm:text-2xl">
                        <RankLabel rank={rank} />
                      </h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {participants.map((result, index) => {
                        const color =
                          houseColors[result.house.color] ?? "#ffffff";

                        return (
                          <div
                            key={result.id}
                            className="result-reveal relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-5 shadow-2xl backdrop-blur-sm"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              borderLeftColor: color,
                              borderLeftWidth: "5px",
                            }}
                          >
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                              Chest {result.participant.chestNo}
                            </p>

                            <h4 className="mt-2 break-words text-xl font-black sm:text-2xl">
                              {result.participant.name}
                            </h4>

                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                              {result.house.name} · House {result.house.code}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <DisplayFooter
            left="Published"
            center="Programme Results"
            right="Returning to scoreboard..."
          />
        </div>

        <style jsx global>{`
          @keyframes displayCardIn {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes displayTitleIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .result-title,
          .result-program,
          .result-category {
            animation: displayTitleIn 600ms ease-out both;
          }

          .result-program {
            animation-delay: 100ms;
          }

          .result-category {
            animation-delay: 200ms;
          }

          .result-reveal {
            opacity: 0;
            animation: displayCardIn 500ms ease-out both;
          }

          .rank-group {
            animation: displayCardIn 500ms ease-out both;
          }

          @media (prefers-reduced-motion: reduce) {
            .result-title,
            .result-program,
            .result-category,
            .result-reveal,
            .rank-group {
              animation: none !important;
              opacity: 1;
            }
          }
        `}</style>
      </main>
    );
  }

  // Normal six-screen house scoreboard.
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-white">
      <ExhibitionBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
        <EventHeader />

        <section className="relative z-10 mt-10 text-center sm:mt-12 lg:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/40 sm:text-sm sm:tracking-[0.5em]">
            House Championship
          </p>

          <h2
            key={currentScreen.code}
            className="mt-4 animate-[displayTitleIn_700ms_ease-out_both] text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-7xl"
          >
            {currentScreen.name}
          </h2>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white/40" />
        </section>

        <section className="relative z-10 mx-auto mt-10 w-full max-w-6xl flex-1 sm:mt-12">
          {loading && houses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-5">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/50">
                Loading scoreboard...
              </p>
            </div>
          ) : rankedHouses.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-lg font-bold uppercase tracking-[0.2em] text-white/40">
                No scoreboard data available
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5">
              {rankedHouses.map((house, index) => {
                const points = getPoints(house);
                const color = houseColors[house.color] ?? "#ffffff";

                return (
                  <div
                    key={house.houseId}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-5 shadow-2xl backdrop-blur-sm transition-all duration-700 sm:rounded-[2rem] sm:px-7 sm:py-7 lg:px-10 lg:py-9"
                    style={{
                      borderLeftColor: color,
                      borderLeftWidth: "5px",
                      animation: `displayCardIn 700ms ease-out ${
                        index * 120
                      }ms both`,
                    }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl font-black sm:h-16 sm:w-16 sm:text-3xl lg:h-20 lg:w-20 lg:rounded-2xl lg:text-4xl"
                        style={{
                          boxShadow:
                            index === 0
                              ? `0 0 25px ${color}35`
                              : "none",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 sm:text-xs sm:tracking-[0.3em]">
                          House {house.houseCode}
                        </p>

                        <h3 className="mt-1 truncate text-2xl font-black sm:text-3xl lg:text-5xl">
                          {house.houseName}
                        </h3>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 sm:text-xs sm:tracking-[0.3em]">
                          Points
                        </p>

                        <p
                          key={`${house.houseId}-${points}`}
                          className="mt-1 text-4xl font-black tabular-nums sm:text-5xl lg:text-7xl"
                        >
                          {points}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <DisplayFooter
          left={currentScreen.code}
          center={`Screen ${screenIndex + 1} / ${screens.length}`}
          right="Auto Update"
        />
      </div>

      <style jsx global>{`
        @keyframes displayCardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes displayTitleIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .exhibition-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(255, 255, 255, 0.035),
              transparent 45%
            ),
            #030407;
        }

        .art-glow {
          position: absolute;
          width: 70vw;
          height: 70vw;
          top: -30vw;
          left: 15vw;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.08);
          filter: blur(100px);
        }

        .art-shape {
          position: absolute;
          width: 30vw;
          height: 30vw;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.13;
          animation: slowFloat 12s ease-in-out infinite alternate;
        }

        .art-shape-blue {
          background: #2563eb;
          left: -10vw;
          top: 30vh;
        }

        .art-shape-green {
          background: #16a34a;
          right: -10vw;
          top: 10vh;
          animation-delay: 2s;
        }

        .art-shape-red {
          background: #dc2626;
          left: 35vw;
          bottom: -20vw;
          animation-delay: 4s;
        }

        .art-shape-gold {
          background: #facc15;
          right: 20vw;
          bottom: -25vw;
          animation-delay: 1s;
        }

        .art-grain {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
        }

        @keyframes slowFloat {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(25px, -20px, 0) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .art-shape,
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}