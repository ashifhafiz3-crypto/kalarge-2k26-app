"use client";

import { useEffect, useMemo, useState } from "react";

type RankNumber = 1 | 2 | 3;

type Entry = {
  id: string;
  chestNo: number;
  participant: {
    name: string;
  };
  house: {
    name: string;
    code: string;
  };
  result: {
    totalMark: number;
    rank: number;
    status: string;
  } | null;
  judgeMarks: {
    id: string;
    totalMark: number;
    judgeId: string;
    entryId: string;
    updatedAt: string;
    judgementDetails: string | null;
  }[];
};

type Program = {
  id: string;
  code: string;
  name: string;
  category: {
    name: string;
  };
  competitionType: string;
  maxMark: number;
  entries: Entry[];
};

type Marks = Record<string, string>;
type JudgementDetails = Record<string, string>;
type SaveState = Record<string, "saving" | "saved" | "error" | undefined>;

type RankedResult = {
  entryId: string;
  totalMark: number;
  rank: RankNumber;
};

type ManualRanks = Record<RankNumber, string[]>;

const EMPTY_RANKS: ManualRanks = {
  1: [],
  2: [],
  3: [],
};

export default function JudgeProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const [program, setProgram] = useState<Program | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [judgementDetails, setJudgementDetails] =
    useState<JudgementDetails>({});
  const [manualRanks, setManualRanks] =
    useState<ManualRanks>(EMPTY_RANKS);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({});
  const [savingFinal, setSavingFinal] = useState(false);

  const isGroup = useMemo(
    () => program?.competitionType?.trim().toUpperCase() === "GROUP",
    [program]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const { programId } = await params;

        const response = await fetch(
          `/api/judge/program/${programId}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/judge/login";
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to load programme.");
        }

        if (!active) return;

        setProgram(data);

        const initialMarks: Marks = {};
        const initialDetails: JudgementDetails = {};
        const initialRanks: ManualRanks = {
          1: [],
          2: [],
          3: [],
        };

        for (const entry of data.entries || []) {
          const myMark = entry.judgeMarks?.[0];

          if (myMark) {
            initialMarks[entry.id] = String(myMark.totalMark);
            initialDetails[entry.id] =
              myMark.judgementDetails ?? "";
          } else if (entry.result) {
            initialMarks[entry.id] = String(entry.result.totalMark);
          }
          if (
            entry.result?.status === "SUBMITTED" ||
            entry.result?.status === "APPROVED"
          ) {
            const rank = Number(entry.result.rank);

            if (rank === 1 || rank === 2 || rank === 3) {
              initialRanks[rank as 1 | 2 | 3].push(entry.id);
            }
          }
        }

        setMarks(initialMarks);
        setJudgementDetails(initialDetails);
        setManualRanks(initialRanks);
      } catch (err) {
        console.error(err);

        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load programme."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [params]);

  const alreadySubmitted = useMemo(() => {
    if (!program) return false;

    return program.entries.some(
      (entry) =>
        entry.result?.status === "SUBMITTED" ||
        entry.result?.status === "APPROVED"
    );
  }, [program]);

  /*
   * Automatic ranking:
   * - All entries must have valid marks.
   * - Equal marks receive the same rank.
   * - Only ranks 1, 2 and 3 are submitted.
   * - Competition ranking is used: 1, 2, 2, 4.
   */
  const automaticRanks = useMemo<RankedResult[] | null>(() => {
    if (!program || alreadySubmitted || program.entries.length === 0) {
      return null;
    }

    const allMarksEntered = program.entries.every((entry) => {
      const value = marks[entry.id];

      return (
        value !== undefined &&
        value.trim() !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= program.maxMark
      );
    });

    if (!allMarksEntered) return null;

    const ranked = [...program.entries]
      .map((entry) => ({
        entryId: entry.id,
        totalMark: Number(marks[entry.id]),
      }))
      .sort((a, b) => b.totalMark - a.totalMark);

    let previousMark: number | null = null;
    let previousRank = 0;

    const results = ranked.map((entry, index) => {
      const rank =
        previousMark !== null && entry.totalMark === previousMark
          ? previousRank
          : index + 1;

      previousMark = entry.totalMark;
      previousRank = rank;

      return {
        ...entry,
        rank: rank as RankNumber,
      };
    });

    return results.filter((result) => result.rank <= 3);
  }, [program, marks, alreadySubmitted]);

  function updateMark(entryId: string, value: string) {
    if (alreadySubmitted) return;

    setMarks((previous) => ({
      ...previous,
      [entryId]: value,
    }));

    setSaveState((previous) => ({
      ...previous,
      [entryId]: undefined,
    }));
  }

  function updateJudgementDetails(entryId: string, value: string) {
    if (alreadySubmitted) return;

    setJudgementDetails((previous) => ({
      ...previous,
      [entryId]: value,
    }));

    setSaveState((previous) => ({
      ...previous,
      [entryId]: undefined,
    }));
  }

  async function saveMark(entry: Entry) {
    if (alreadySubmitted || !program) return;

    const value = marks[entry.id];

    if (value === undefined || value.trim() === "") {
      setSaveState((previous) => ({
        ...previous,
        [entry.id]: "error",
      }));
      alert("Enter a mark first.");
      return;
    }

    const totalMark = Number(value);

    if (
      !Number.isFinite(totalMark) ||
      totalMark < 0 ||
      totalMark > program.maxMark
    ) {
      setSaveState((previous) => ({
        ...previous,
        [entry.id]: "error",
      }));

      alert(`Mark must be between 0 and ${program.maxMark}.`);
      return;
    }

    setSavingEntry(entry.id);
    setSaveState((previous) => ({
      ...previous,
      [entry.id]: "saving",
    }));

    try {
      const response = await fetch("/api/judge/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId: program.id,
          entryId: entry.id,
          totalMark,
          judgementDetails: judgementDetails[entry.id] ?? "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveState((previous) => ({
          ...previous,
          [entry.id]: "error",
        }));

        alert(data.error || "Failed to save mark.");
        return;
      }

      setSaveState((previous) => ({
        ...previous,
        [entry.id]: "saved",
      }));

      window.setTimeout(() => {
        setSaveState((previous) => ({
          ...previous,
          [entry.id]: undefined,
        }));
      }, 2500);
    } catch (err) {
      console.error(err);

      setSaveState((previous) => ({
        ...previous,
        [entry.id]: "error",
      }));

      alert("Failed to save mark.");
    } finally {
      setSavingEntry(null);
    }
  }

  /*
   * Manual ranking:
   * - Multiple entries can be selected for the same rank.
   * - An entry cannot be selected in two different ranks.
   */
  function selectRank(rank: RankNumber, entryId: string) {
    if (alreadySubmitted || automaticRanks) return;

    setManualRanks((previous) => {
      const alreadySelected = previous[rank].includes(entryId);

      const next: ManualRanks = {
        1: previous[1].filter((id) => id !== entryId),
        2: previous[2].filter((id) => id !== entryId),
        3: previous[3].filter((id) => id !== entryId),
      };

      if (!alreadySelected) {
        next[rank] = [...next[rank], entryId];
      }

      return next;
    });
  }

  function clearRank(rank: RankNumber) {
    if (alreadySubmitted || automaticRanks) return;

    setManualRanks((previous) => ({
      ...previous,
      [rank]: [],
    }));
  }

  function getEntry(entryId: string) {
    return program?.entries.find((entry) => entry.id === entryId);
  }

  function getRank(entryId: string): RankNumber | null {
    if (automaticRanks) {
      const result = automaticRanks.find(
        (item) => item.entryId === entryId
      );

      return result?.rank ?? null;
    }

    if (manualRanks[1].includes(entryId)) return 1;
    if (manualRanks[2].includes(entryId)) return 2;
    if (manualRanks[3].includes(entryId)) return 3;

    return null;
  }

  function getDisplayName(entry: Entry) {
    return isGroup ? entry.house.name : entry.participant.name;
  }

  function getDisplaySubtitle(entry: Entry) {
    return isGroup ? `House ${entry.house.code}` : entry.house.name;
  }

  function getRankedEntries() {
    if (!program) return [];

    if (automaticRanks) {
      return automaticRanks
        .map((result) => ({
          entry: getEntry(result.entryId),
          rank: result.rank,
        }))
        .filter(
          (
            item
          ): item is { entry: Entry; rank: RankNumber } =>
            Boolean(item.entry)
        );
    }

    return ([1, 2, 3] as RankNumber[]).flatMap((rank) =>
      manualRanks[rank]
        .map((id) => getEntry(id))
        .filter((entry): entry is Entry => Boolean(entry))
        .map((entry) => ({ entry, rank }))
    );
  }

  async function submitFinalResult() {
    if (!program || alreadySubmitted) return;

    let results: RankedResult[];

    if (automaticRanks) {
      results = automaticRanks;
    } else {
      results = ([1, 2, 3] as RankNumber[]).flatMap((rank) =>
        manualRanks[rank].map((entryId) => ({
          entryId,
          totalMark: Number(marks[entryId]),
          rank,
        }))
      );

      if (
        [1, 2, 3].some(
          (rank) => manualRanks[rank as RankNumber].length === 0
        )
      ) {
        alert("Select at least one participant for each rank.");
        return;
      }
    }

    if (results.length === 0) {
      alert("No participants selected.");
      return;
    }

    for (const result of results) {
      const entry = getEntry(result.entryId);

      if (
        !entry ||
        !Number.isFinite(result.totalMark) ||
        result.totalMark < 0 ||
        result.totalMark > program.maxMark
      ) {
        alert(
          `Enter a valid mark for ${
            entry ? getDisplayName(entry) : "the selected entry"
          }.`
        );
        return;
      }
    }

    const rankingText = results
      .map((result) => {
        const entry = getEntry(result.entryId);

        return `Rank ${result.rank}. ${
          entry ? getDisplayName(entry) : "Unknown"
        } — ${result.totalMark} marks`;
      })
      .join("\n");

    const confirmed = window.confirm(
      `Submit the final result?\n\n${rankingText}\n\nAfter submission, this programme will be locked.`
    );

    if (!confirmed) return;

    setSavingFinal(true);
    setError("");

    try {
      const response = await fetch("/api/judge/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId: program.id,
          mode: automaticRanks ? "automatic" : "manual",
          results,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            data.error ||
            "Failed to submit final result."
        );
        return;
      }

      alert(
        data.message ||
          "Final result submitted successfully. Waiting for admin approval."
      );

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to submit final result.");
    } finally {
      setSavingFinal(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-800" />
            <div className="h-5 w-96 max-w-full rounded-lg bg-slate-900" />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-5 w-40 rounded bg-slate-800" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-slate-800" />
                <div className="h-4 w-2/3 rounded bg-slate-800" />
                <div className="h-4 w-1/2 rounded bg-slate-800" />
              </div>
            </div>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="h-6 w-40 rounded bg-slate-800" />
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="h-14 rounded-xl bg-slate-800" />
                  <div className="h-14 rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            !
          </div>
          <h1 className="mt-5 text-2xl font-black">
            Programme Error
          </h1>
          <p className="mt-3 text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!program) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-black">
            Programme not found
          </h1>
          <p className="mt-3 text-slate-400">
            No programme data is available.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {program.name}
            </h1>

            {alreadySubmitted && (
              <span className="animate-pulse rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                FINAL RESULT LOCKED
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>{program.code}</span>
            <span>•</span>
            <span>{program.category.name}</span>
            <span>•</span>
            <span>{isGroup ? "GROUP" : "INDIVIDUAL"}</span>
          </div>
        </header>

        {/* INSTRUCTIONS */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-slate-900 p-6 shadow-2xl shadow-blue-950/10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-lg text-blue-300">
              ✓
            </div>

            <div>
              <h2 className="font-black text-blue-300">
                Judge Instructions
              </h2>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                <li>
                  • Enter marks for all {isGroup ? "houses/teams" : "participants"}.
                </li>
                <li>
                  • Add judgement details when required.
                </li>
                <li>
                  • Discuss the final ranking with the assigned judges.
                </li>
                <li>
                  • When all marks are entered, ranking is automatic.
                </li>
                <li>
                  • Participants with equal marks receive the same rank.
                </li>
                <li>
                  • If marks are missing, select multiple participants for each rank manually.
                </li>
                <li>
                  • After final submission, this programme becomes locked.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* MODE SUMMARY */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Judging Mode
              </p>
              <p className="mt-1 text-lg font-black">
                {isGroup
                  ? "One mark per house / team"
                  : "One mark per participant"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300">
              Max Mark: {program.maxMark}
            </div>
          </div>
        </section>

        {/* ENTRIES */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                {isGroup ? "Teams" : "Participants"}
              </p>
              <h2 className="mt-1 text-2xl font-black">Entries</h2>
            </div>

            <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300">
              {program.entries.length}
            </div>
          </div>

          <div className="space-y-4">
            {program.entries.map((entry) => {
              const rank = getRank(entry.id);
              const state = saveState[entry.id];

              return (
                <article
                  key={entry.id}
                  className={`overflow-hidden rounded-3xl border bg-slate-900/70 transition-all duration-300 ${
                    rank === 1
                      ? "border-emerald-500/40 shadow-lg shadow-emerald-950/10"
                      : rank === 2
                      ? "border-blue-500/30"
                      : rank === 3
                      ? "border-amber-500/30"
                      : "border-slate-800"
                  }`}
                >
                  {/* ENTRY HEADER */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-sm font-black text-slate-300">
                        {entry.chestNo}
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Chest {entry.chestNo}
                        </p>
                        <h3 className="mt-1 text-xl font-black md:text-2xl">
                          {getDisplayName(entry)}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {getDisplaySubtitle(entry)}
                        </p>
                      </div>
                    </div>

                    {rank && (
                      <div
                        className={`rounded-full px-4 py-2 text-sm font-black ${
                          rank === 1
                            ? "bg-emerald-500/10 text-emerald-400"
                            : rank === 2
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        Rank {rank}
                      </div>
                    )}
                  </div>

                  {/* JUDGEMENT AREA */}
                  <div className="p-5 md:p-6">
                    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                      {/* MARK */}
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-300">
                          {isGroup
                            ? `Team Mark (0–${program.maxMark})`
                            : `My Mark (0–${program.maxMark})`}
                        </label>

                        <input
                          type="number"
                          min="0"
                          max={program.maxMark}
                          value={marks[entry.id] ?? ""}
                          disabled={alreadySubmitted}
                          onChange={(event) =>
                            updateMark(entry.id, event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-xl font-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="0"
                        />
                      </div>

                      {/* DETAILS */}
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-300">
                          Judgement Details
                        </label>

                        <textarea
                          value={judgementDetails[entry.id] ?? ""}
                          disabled={alreadySubmitted}
                          onChange={(event) =>
                            updateJudgementDetails(
                              entry.id,
                              event.target.value
                            )
                          }
                          placeholder="Enter comments or judgement notes..."
                          rows={4}
                          className="w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* SAVE BAR */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={
                          alreadySubmitted || savingEntry === entry.id
                        }
                        onClick={() => saveMark(entry)}
                        className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingEntry === entry.id ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Saving...
                          </>
                        ) : (
                          "Save Mark"
                        )}
                      </button>

                      {!alreadySubmitted && state === "saved" && (
                        <span className="animate-in fade-in text-sm font-bold text-emerald-400">
                          ✓ Saved successfully
                        </span>
                      )}

                      {!alreadySubmitted && state === "error" && (
                        <span className="text-sm font-bold text-red-400">
                          Save failed
                        </span>
                      )}

                      {!alreadySubmitted && !state && (
                        <span className="text-xs text-slate-500">
                          Save mark and judgement details together.
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* AUTOMATIC RANK NOTICE */}
        {!alreadySubmitted && automaticRanks && (
          <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl text-emerald-400">
                ✓
              </div>

              <div>
                <h2 className="text-lg font-black text-emerald-300">
                  Automatic Ranking Ready
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  All marks are entered. Equal marks receive the same rank.
                  The top three rank positions are calculated automatically.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* FINAL RESULT */}
        {!alreadySubmitted && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                  Final Result
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Final Top 3
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  {automaticRanks
                    ? "Ranking is automatic because all marks are entered."
                    : "Select one or more participants for each rank after discussion."}
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-400">
                {isGroup
                  ? "HOUSE / TEAM RANKING"
                  : "PARTICIPANT RANKING"}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {([1, 2, 3] as RankNumber[]).map((rank) => {
                const selectedIds = automaticRanks
                  ? automaticRanks
                      .filter((result) => result.rank === rank)
                      .map((result) => result.entryId)
                  : manualRanks[rank];

                const selectedEntries = selectedIds
                  .map((id) => getEntry(id))
                  .filter((entry): entry is Entry => Boolean(entry));

                return (
                  <div
                    key={rank}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
                          Rank {rank}
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {selectedEntries.length > 0
                            ? `${selectedEntries.length} selected`
                            : "No participants selected"}
                        </p>
                      </div>

                      {selectedEntries.length > 0 && !automaticRanks && (
                        <button
                          type="button"
                          onClick={() => clearRank(rank)}
                          className="rounded-lg px-3 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/10"
                        >
                          Clear Rank {rank}
                        </button>
                      )}
                    </div>

                    {selectedEntries.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {selectedEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
                          >
                            <div>
                              <p className="font-bold">
                                {getDisplayName(entry)}
                              </p>
                              <p className="text-xs text-slate-500">
                                Chest {entry.chestNo} • {entry.house.name}
                              </p>
                            </div>
                            <p className="font-black text-emerald-300">
                              {marks[entry.id] ?? "—"} marks
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {program.entries.map((entry) => {
                        const isSelected = automaticRanks
                          ? automaticRanks.some(
                              (result) =>
                                result.entryId === entry.id &&
                                result.rank === rank
                            )
                          : manualRanks[rank].includes(entry.id);

                        const currentRank = getRank(entry.id);
                        const usedElsewhere =
                          currentRank !== null && currentRank !== rank;

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            disabled={
                              Boolean(automaticRanks) ||
                              usedElsewhere ||
                              alreadySubmitted
                            }
                            onClick={() => selectRank(rank, entry.id)}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-950/20"
                                : usedElsewhere
                                ? "cursor-not-allowed border-slate-800 opacity-30"
                                : "border-slate-700 bg-slate-900 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                  Chest {entry.chestNo}
                                </p>
                                <p className="mt-1 font-black">
                                  {getDisplayName(entry)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {entry.house.name} • House{" "}
                                  {entry.house.code}
                                </p>
                              </div>

                              {isSelected && (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black">
                                  {rank}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 border-t border-slate-800 pt-3 text-sm font-bold text-slate-400">
                              Mark: {marks[entry.id] ?? "—"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={submitFinalResult}
              disabled={
                savingFinal ||
                (!automaticRanks &&
                  ([1, 2, 3] as RankNumber[]).some(
                    (rank) => manualRanks[rank].length === 0
                  ))
              }
              className="relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-blue-600 px-6 py-5 text-lg font-black transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingFinal ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting Final Result...
                </>
              ) : (
                "Submit Final Result"
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              After submission, the programme will be locked and sent for
              admin approval.
            </p>
          </section>
        )}

        {/* LOCKED RESULT */}
        {alreadySubmitted && (
          <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl text-emerald-400">
                ✓
              </div>

              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
                  Final Result
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  FINAL RESULT LOCKED
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  This programme has already received its final result and
                  can no longer be edited or submitted again.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {([1, 2, 3] as RankNumber[]).map((rank) => {
                const entries = program.entries.filter(
                  (entry) =>
                    entry.result?.rank === rank &&
                    (entry.result.status === "SUBMITTED" ||
                      entry.result.status === "APPROVED")
                );

                return (
                  <div
                    key={rank}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                      Rank {rank}
                    </p>

                    {entries.length === 0 ? (
                      <p className="mt-2 text-lg font-black">—</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="border-b border-slate-800 pb-3 last:border-0 last:pb-0"
                          >
                            <p className="text-lg font-black">
                              {getDisplayName(entry)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Chest {entry.chestNo} • {entry.house.code}
                            </p>
                            <p className="mt-2 text-2xl font-black">
                              {entry.result?.totalMark ?? "—"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                              Mark
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* FINAL SUBMISSION OVERLAY */}
      {savingFinal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />
            </div>
            <h2 className="mt-5 text-xl font-black">
              Submitting Final Result
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Please wait while the result is being submitted.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}