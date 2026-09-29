"use client";

import { useEffect, useMemo, useState } from "react";

type Result = {
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
      id: string;
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

type ProgramGroup = {
  programId: string;
  program: Result["program"];
  results: Result[];
  approvedAt: string | null;
};

type HouseScore = {
  id: string;
  name: string;
  code: string;
  color: string;
  points: number;
  rank: number;
};

const houseColors: Record<string, string> = {
  Blue: "#2563eb",
  Red: "#dc2626",
  Green: "#16a34a",
};

const categoryOrder: Record<string, number> = {
  SSR: 1,
  SR: 2,
  JR: 3,
  SJR: 4,
  GN: 5,
};

const houseOrder = ["Blue", "Red", "Green"];

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadResults() {
    try {
      const response = await fetch("/api/public/results", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load results");
      }

      setResults(data.results || []);
      setError("");
    } catch (err) {
      console.error("PUBLIC RESULTS ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load results"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();

    const refresh = setInterval(loadResults, 10000);

    return () => clearInterval(refresh);
  }, []);

  const approvedResults = useMemo(
    () => results.filter((result) => result.status === "APPROVED"),
    [results]
  );

  // OVERALL HOUSE SCOREBOARD
  const houseScores = useMemo<HouseScore[]>(() => {
    const scoreMap = new Map<string, HouseScore>();

    // Ensure all three houses appear, even if they have zero points.
    for (const color of houseOrder) {
      scoreMap.set(color, {
        id: color,
        name: color,
        code: color,
        color,
        points: 0,
        rank: 0,
      });
    }

    for (const result of approvedResults) {
      const color = result.house.color;
      const existing = scoreMap.get(color);

      if (existing) {
        existing.name = result.house.name;
        existing.code = result.house.code;
        existing.points += Number(result.points) || 0;
      } else {
        scoreMap.set(color, {
          id: result.house.id,
          name: result.house.name,
          code: result.house.code,
          color,
          points: Number(result.points) || 0,
          rank: 0,
        });
      }
    }

    const sorted = [...scoreMap.values()].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return houseOrder.indexOf(a.color) - houseOrder.indexOf(b.color);
    });

    return sorted.map((house, index) => ({
      ...house,
      rank: index + 1,
    }));
  }, [approvedResults]);

  // GROUP ALL APPROVED RESULTS BY PROGRAM
  const programGroups = useMemo<ProgramGroup[]>(() => {
    const map = new Map<string, Result[]>();

    for (const result of approvedResults) {
      if (!map.has(result.programId)) {
        map.set(result.programId, []);
      }

      map.get(result.programId)!.push(result);
    }

    const groups: ProgramGroup[] = [];

    for (const [programId, programResults] of map.entries()) {
      // Keep ALL participants, including participants sharing the same rank.
      const sortedResults = [...programResults].sort(
        (a, b) => a.rank - b.rank
      );

      if (sortedResults.length === 0) continue;

      groups.push({
        programId,
        program: sortedResults[0].program,
        results: sortedResults,
        approvedAt:
          sortedResults
            .map((result) => result.approvedAt)
            .filter(Boolean)
            .sort()
            .at(-1) || null,
      });
    }

    groups.sort((a, b) => {
      const categoryA =
        categoryOrder[a.program.category.code] ?? 99;
      const categoryB =
        categoryOrder[b.program.category.code] ?? 99;

      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      return a.program.name.localeCompare(b.program.name, "ml");
    });

    return groups;
  }, [approvedResults]);

  const latestGroup = useMemo(() => {
    if (!programGroups.length) {
      return null;
    }

    return [...programGroups].sort((a, b) => {
      const timeA = a.approvedAt
        ? new Date(a.approvedAt).getTime()
        : 0;

      const timeB = b.approvedAt
        ? new Date(b.approvedAt).getTime()
        : 0;

      return timeB - timeA;
    })[0];
  }, [programGroups]);

  function positionLabel(rank: number) {
    if (rank === 1) return "1ST";
    if (rank === 2) return "2ND";
    if (rank === 3) return "3RD";
    return `${rank}TH`;
  }

  function positionEmoji(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  }

  return (
    <main className="min-h-screen bg-[#030407] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/30 sm:text-sm">
              Ahlul Quran Students Association
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-[-0.06em] sm:text-6xl lg:text-8xl">
              KALARGE
            </h1>

            <p className="mt-1 text-sm font-bold tracking-[0.5em] text-white/30 sm:text-lg">
              2K26
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-400 sm:text-xs">
              Live
            </span>
          </div>
        </header>

        {/* TITLE */}
        <section className="mt-12 text-center lg:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-white/30 sm:text-sm">
            KALARGE 2K26
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-7xl">
            Published Results
          </h2>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-white/30" />

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
            Official results published by the Ahlul Quran Students Association.
          </p>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-center">
            <p className="text-sm font-bold text-red-300">{error}</p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mx-auto mt-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white/70" />

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-white/30">
              Loading results...
            </p>
          </div>
        )}

        {/* OVERALL HOUSE SCOREBOARD */}
        {!loading && !error && (
          <section className="mx-auto mt-12 max-w-6xl">
            <div className="mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/35">
                KALARGE 2K26
              </p>

              <h3 className="mt-2 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
                Overall
              </h3>

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-white/30 sm:text-sm">
                House Points & Rankings
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {houseScores.map((house) => {
                const houseColor =
                  houseColors[house.color] || "#ffffff";

                return (
                  <article
                    key={house.id}
                    className={`relative overflow-hidden rounded-[2rem] border bg-white/[0.04] p-6 text-center transition duration-300 hover:-translate-y-1 ${
                      house.rank === 1
                        ? "border-yellow-400/40 shadow-[0_0_35px_rgba(250,204,21,0.08)]"
                        : "border-white/10"
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 h-1.5 w-full"
                      style={{ backgroundColor: houseColor }}
                    />

                    {house.rank === 1 && (
                      <div className="absolute right-4 top-4 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-300">
                        Leader
                      </div>
                    )}

                    <div
                      className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-3xl text-3xl font-black"
                      style={{
                        color: houseColor,
                        backgroundColor: `${houseColor}18`,
                        border: `1px solid ${houseColor}45`,
                      }}
                    >
                      {house.rank}
                    </div>

                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                      {positionLabel(house.rank)} PLACE
                    </p>

                    <h4
                      className="mt-2 text-2xl font-black sm:text-3xl"
                      style={{ color: houseColor }}
                    >
                      {house.name}
                    </h4>

                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-white/30">
                      House {house.code}
                    </p>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                        Total Points
                      </p>

                      <p className="mt-2 text-5xl font-black tracking-tight sm:text-6xl">
                        {house.points}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* NO RESULTS */}
        {!loading && !error && programGroups.length === 0 && (
          <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 text-center">
            <p className="text-xl font-black">
              No published programme results yet
            </p>

            <p className="mt-3 text-sm text-white/40">
              The overall scoreboard will update when results are approved.
            </p>
          </div>
        )}

        {/* LATEST RESULT */}
        {!loading && !error && latestGroup && (
          <section className="mx-auto mt-12 max-w-6xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              <p className="text-xs font-bold uppercase tracking-[0.35em] text-green-400">
                Latest Published
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055]">
              <div className="border-b border-white/10 px-6 py-6 sm:px-8 lg:px-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">
                      {latestGroup.program.category.code}
                    </p>

                    <h3 className="mt-2 text-3xl font-black sm:text-4xl lg:text-5xl">
                      {latestGroup.program.name}
                    </h3>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/25">
                    {latestGroup.program.code}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {latestGroup.results.map((result) => (
                  <ResultRow
                    key={result.id}
                    result={result}
                    positionLabel={positionLabel(result.rank)}
                    positionEmoji={positionEmoji(result.rank)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ALL GROUPED RESULTS */}
        {!loading && !error && programGroups.length > 0 && (
          <section className="mx-auto mt-14 max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/30">
                  Complete Results
                </p>

                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                  All Published Programmes
                </h3>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <span className="text-xs font-bold text-white/50">
                  {programGroups.length} PROGRAMMES
                </span>
              </div>
            </div>

            <div className="grid gap-6">
              {programGroups.map((group) => (
                <article
                  key={group.programId}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
                >
                  {/* PROGRAM HEADER */}
                  <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                            {group.program.category.code}
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">
                            {group.program.code}
                          </span>
                        </div>

                        <h4 className="mt-3 text-2xl font-black sm:text-3xl">
                          {group.program.name}
                        </h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                          Result
                        </p>

                        <p className="mt-1 text-xs font-bold text-green-400">
                          PUBLISHED
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ALL PARTICIPANTS */}
                  <div className="divide-y divide-white/10">
                    {group.results.map((result) => (
                      <ResultRow
                        key={result.id}
                        result={result}
                        positionLabel={positionLabel(result.rank)}
                        positionEmoji={positionEmoji(result.rank)}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-16 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              KALARGE 2K26
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              Official Published Results
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              Auto Update 10s
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function ResultRow({
  result,
  positionLabel,
  positionEmoji,
}: {
  result: Result;
  positionLabel: string;
  positionEmoji: string;
}) {
  const houseColor = houseColors[result.house.color] || "#ffffff";

  return (
    <div className="relative px-6 py-6 sm:px-8 lg:px-10">
      {/* HOUSE COLOR STRIP */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{
          backgroundColor: houseColor,
        }}
      />

      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {/* POSITION */}
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/[0.06] sm:h-16 sm:w-16">
          <span className="text-xl leading-none">{positionEmoji}</span>

          <span className="mt-1 text-[8px] font-black uppercase tracking-wider text-white/30">
            {positionLabel}
          </span>
        </div>

        {/* PARTICIPANT */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
            Chest {result.participant.chestNo}
          </p>

          <h5 className="mt-1 truncate text-xl font-black sm:text-2xl lg:text-3xl">
            {result.participant.name}
          </h5>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]"
              style={{
                color: houseColor,
                backgroundColor: `${houseColor}18`,
              }}
            >
              {result.house.name}
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
              House {result.house.code}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}