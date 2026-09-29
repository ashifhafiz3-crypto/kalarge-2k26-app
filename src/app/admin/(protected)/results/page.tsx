"use client";

import { useCallback, useEffect, useState } from "react";

type Result = {
  id: string;
  programId: string;
  totalMark: number;
  rank: number | null;
  points: number;
  status: string;
  submittedAt?: string;

  participant?: {
    id: string;
    name: string;
    chestNo: number;
    role: string;
  } | null;

  house?: {
    id: string;
    name: string;
    code: string;
    color: string;
  } | null;

  entry?: {
    id: string;
    entryType: string;
  } | null;
};

type ResultGroup = {
  programId: string;
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
  results: Result[];
};

export default function ResultsPage() {
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revealing, setRevealing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/results", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load results.");
      }

      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (err) {
      console.error("ADMIN RESULTS LOAD ERROR:", err);
      setGroups([]);
      setError(
        err instanceof Error ? err.message : "Could not load results."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  // APPROVE ALL SUBMITTED RESULTS FOR ONE PROGRAMME
  const handleApproveGroup = async (programId: string, programName: string) => {
    const confirmed = window.confirm(
      `Approve ALL submitted results for "${programName}"?`
    );

    if (!confirmed) return;

    setApprovingId(programId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/results/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve results.");
      }

      setMessage(
        data.message ||
          `${data.approvedCount ?? "All"} results approved successfully.`
      );

      await loadResults();
    } catch (err) {
      console.error("GROUP RESULT APPROVAL ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Approval failed."
      );
    } finally {
      setApprovingId(null);
    }
  };

  // GRAND CHAMPION REVEAL
  const handleReveal = async () => {
    setRevealing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/champion/reveal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          durationSeconds: 240,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to start the reveal.");
      }

      setMessage("Grand Champion reveal started.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Reveal failed."
      );
    } finally {
      setRevealing(false);
    }
  };

  const totalPending = groups.reduce(
    (sum, group) => sum + group.results.length,
    0
  );

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-sky-400">
              KALARGE 2K26
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Results Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Review and approve submitted programme results.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadResults()}
            disabled={loading || approvingId !== null}
            className="rounded-xl border border-slate-700 bg-[#081329] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:bg-[#0b1a34] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </header>

        {/* GRAND CHAMPION REVEAL */}
        <section className="rounded-2xl border border-amber-500/30 bg-[#081329] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h2 className="text-xl font-bold text-white">
                  Grand Champion Reveal
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Start the four-minute champion reveal on the exhibition
                display.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleReveal()}
              disabled={revealing}
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold tracking-wide text-[#1b1200] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revealing ? "STARTING..." : "REVEAL CHAMPION"}
            </button>
          </div>
        </section>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        {/* SUBMITTED RESULTS */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Submitted Results
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Approve all results of a programme with one action.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-700 bg-[#081329] px-3 py-1.5 text-xs font-semibold text-slate-300">
                {groups.length} programmes
              </span>

              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                {totalPending} pending
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-[#081329] py-12 text-center text-sm text-slate-400">
              Loading results...
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#081329] p-10 text-center">
              <p className="text-lg font-bold text-white">
                No submitted results found.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                All submitted results have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((group) => {
                const submittedCount = group.results.filter(
                  (result) => result.status === "SUBMITTED"
                ).length;

                return (
                  <article
                    key={group.programId}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-[#081329] shadow-lg shadow-black/10"
                  >
                    {/* PROGRAM HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-4 sm:p-5">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white">
                          {group.program?.name ?? "Unnamed programme"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {group.program?.code ?? ""}
                          {" · "}
                          {group.program?.category?.name ?? ""}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {submittedCount} result
                          {submittedCount === 1 ? "" : "s"} awaiting approval
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                          SUBMITTED
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void handleApproveGroup(
                              group.programId,
                              group.program?.name ?? "this programme"
                            )
                          }
                          disabled={
                            approvingId !== null || submittedCount === 0
                          }
                          className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-[#001326] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {approvingId === group.programId
                            ? "Approving..."
                            : "Approve All"}
                        </button>
                      </div>
                    </div>

                    {/* RESULTS TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-[#050d1e] text-xs uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-4 py-3 font-semibold">
                              Participant
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Chest No.
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              House
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Mark
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Rank
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Points
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.results.map((result) => (
                            <tr
                              key={result.id}
                              className="border-t border-slate-800/80 transition hover:bg-slate-800/30"
                            >
                              <td className="px-4 py-4 font-semibold text-slate-100">
                                {result.participant?.name ?? "—"}
                              </td>

                              <td className="px-4 py-4 text-slate-300">
                                {result.participant?.chestNo ?? "—"}
                              </td>

                              <td className="px-4 py-4 text-slate-300">
                                <span
                                  className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      result.house?.color?.toLowerCase() ??
                                      "#64748b",
                                  }}
                                />
                                {result.house?.name ?? "—"}
                              </td>

                              <td className="px-4 py-4 text-slate-300">
                                {result.totalMark}
                              </td>

                              <td className="px-4 py-4 text-slate-300">
                                {result.rank ?? "—"}
                              </td>

                              <td className="px-4 py-4 font-bold text-sky-300">
                                {result.points}
                              </td>

                              <td className="px-4 py-4">
                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                                  {result.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}