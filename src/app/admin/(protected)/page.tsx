"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type AdminResult = {
  id: string;
  totalMark: number;
  rank: number;
  points: number;
  status: string;
  participant: {
    name: string;
    chestNo: number;
  };
  house: {
    name: string;
    code: string;
  };
  program: {
    name: string;
    category: {
      code: string;
      name: string;
    };
  };
};

export default function AdminDashboard() {
  const router = useRouter();

  const [houses, setHouses] = useState<House[]>([]);
  const [pending, setPending] = useState<AdminResult[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        scoreboardResponse,
        resultsResponse,
        publicResponse,
      ] = await Promise.all([
        fetch("/api/scoreboard", { cache: "no-store" }),
        fetch("/api/admin/results", { cache: "no-store" }),
        fetch("/api/public/results", { cache: "no-store" }),
      ]);

      const scoreboardData = await scoreboardResponse.json();
      const resultsData = await resultsResponse.json();
      const publicData = await publicResponse.json();

      if (scoreboardData.success) {
        setHouses(scoreboardData.scoreboard || []);
      }

      const submittedResults = (resultsData.groups || []).flatMap(
        (group: any) => group.results || []
      );

      setPending(submittedResults);
      setApprovedCount((publicData.results || []).length);
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  useEffect(() => {
    loadDashboard();

    const refresh = setInterval(loadDashboard, 10000);

    return () => clearInterval(refresh);
  }, []);

  const totalPoints = houses.reduce(
    (sum, house) => sum + house.totalPoints,
    0
  );

  return (
    <main className="min-h-screen bg-[#030407] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-250px] right-[-200px] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/30">
              Ahlul Quran Students Association
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-6xl">
              KALARGE <span className="text-white/30">2K26</span>
            </h1>

            <p className="mt-2 text-sm font-medium text-white/40">
              Administration Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.9)]" />

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
                System Live
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pending Approval"
            value={pending.length}
            accent="amber"
          />

          <StatCard
            label="Approved Results"
            value={approvedCount}
            accent="green"
          />

          <StatCard
            label="Total Points"
            value={totalPoints}
            accent="blue"
          />

          <StatCard
            label="Active Houses"
            value={houses.length}
            accent="purple"
          />
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-10">
          <SectionTitle title="Quick Actions" />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <ActionCard
              href="/admin/results"
              title="Result Approval"
              description="Review and approve submitted results"
            />

            <ActionCard
              href="/results"
              title="Public Results"
              description="View officially published results"
            />

            <ActionCard
              href="/display"
              title="Exhibition Display"
              description="Open the live exhibition scoreboard"
            />

            <ActionCard
              href="/judge"
              title="Judge Panel"
              description="View assigned judging programs"
            />

            <ActionCard
              href="/admin/accounts"
              title="Account Management"
              description="Manage admin and judge accounts"
            />
          </div>
        </section>

        {/* HOUSE SCOREBOARD */}
        <section className="mt-10">
          <SectionTitle title="Live House Scores" />

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/40">
                Loading scoreboard...
              </div>
            ) : (
              houses.map((house, index) => (
                <div
                  key={house.houseId}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7"
                >
                  <div
                    className="absolute left-0 top-0 h-full w-1.5"
                    style={{
                      backgroundColor:
                        house.color === "Blue"
                          ? "#2563eb"
                          : house.color === "Red"
                            ? "#dc2626"
                            : "#16a34a",
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">
                        Rank #{index + 1}
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        {house.houseName}
                      </h3>

                      <p className="mt-1 text-sm text-white/30">
                        House {house.houseCode}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                        Points
                      </p>

                      <p className="mt-1 text-5xl font-black">
                        {house.totalPoints}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-5 gap-2">
                    {Object.entries(house.categoryScores).map(
                      ([category, points]) => (
                        <div
                          key={category}
                          className="rounded-xl bg-white/[0.05] p-2 text-center"
                        >
                          <p className="text-[9px] font-bold text-white/30">
                            {category}
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {points}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PENDING RESULTS */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle title="Pending Approval" />

            <Link
              href="/admin/results"
              className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300"
            >
              View All →
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            {pending.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-lg font-bold">
                  No pending results
                </p>

                <p className="mt-2 text-sm text-white/30">
                  All submitted results have been processed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {pending.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-bold">
                        {result.program.name}
                      </p>

                      <p className="mt-1 text-sm text-white/40">
                        {result.participant.name}
                        {" • "}
                        Chest {result.participant.chestNo}
                        {" • "}
                        {result.house.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-white/30">
                          MARK
                        </p>

                        <p className="font-black">
                          {result.totalMark}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-white/30">
                          RANK
                        </p>

                        <p className="font-black">
                          #{result.rank}
                        </p>
                      </div>

                      <Link
                        href="/admin/results"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/20">
            KALARGE 2K26 • Administration System
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  const colors: Record<string, string> = {
    amber: "text-amber-400",
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-3 text-4xl font-black ${
          colors[accent] || "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-black tracking-tight">
      {title}
    </h2>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <h3 className="text-lg font-black group-hover:text-blue-400">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/35">
        {description}
      </p>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-white/25 group-hover:text-white/50">
        Open →
      </p>
    </Link>
  );
}