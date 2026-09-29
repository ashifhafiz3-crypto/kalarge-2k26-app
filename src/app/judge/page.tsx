"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const judges = [
  { code: "J01", name: "Mubashir Wafi" },
  { code: "J02", name: "Haris Hudawi" },
  { code: "J03", name: "Rabeeh Baqawi" },
  { code: "J04", name: "Aslam Faisy" },
  { code: "J05", name: "Hafiz Fayiz Hudawi" },
  { code: "J06", name: "Hafiz Sirajudheen Faisy" },
  { code: "J07", name: "Abdul Vahid Wafi" },
  { code: "J08", name: "Jabir Baqavi" },
  { code: "J09", name: "Suhail Baqavi" },
  { code: "J10", name: "Hafiz Ashif" },
];

type Assignment = {
  id: string;
  programId: string;
  status?: string;
  program?: {
    id?: string;
    program_name?: string;
    name?: string;
    program_code?: string;
    code?: string;
    category?: {
      name?: string;
    };
    status?: string;
  };
};

export default function JudgePage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAssignments() {
      try {
        const response = await fetch("/api/judge/assignments", {
          cache: "no-store",
        });

        if (!active) return;

        if (response.status === 401) {
          setLoggedIn(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `Request failed: ${response.status}`
          );
        }

        if (!active) return;

        setAssignments(data.assignments ?? []);
        setLoggedIn(true);
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Could not load assignments. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAssignments();

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/judge/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      window.location.replace("/judge");
    } catch (err) {
      console.error(err);
      setError("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  }

  const completedCount = assignments.filter(
    (assignment) =>
      assignment.status === "SUBMITTED" ||
      assignment.status === "COMPLETED" ||
      assignment.status === "APPROVED"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-sm font-medium text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="text-2xl font-black">Something went wrong</h1>
          <p className="mt-3 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-3xl font-black text-blue-400">
              K
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400">
              KALARGE 2K26
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Judge Portal
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Select your name to access your assigned programmes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Judge Login</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose your judge profile.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {judges.map((judge) => (
                <button
                  key={judge.code}
                  onClick={() =>
                    router.push(`/judge/login?judge=${judge.code}`)
                  }
                  className="group flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-blue-500/60 hover:bg-blue-500/10"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-blue-300 transition group-hover:bg-blue-500/20">
                    {judge.code}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-100">
                      {judge.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {judge.code}
                    </p>
                  </div>

                  <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            KALARGE 2K26 • Judge Management System
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black">
              K
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                KALARGE 2K26
              </p>
              <h1 className="mt-1 text-xl font-black sm:text-2xl">
                Judge Dashboard
              </h1>
            </div>
          </div>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout ↗"}
          </button>
        </header>

        {/* WELCOME */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
            Welcome back
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Judge
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Your assigned programmes are listed below. Open a programme
            to enter marks, add judgement details, and submit results.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Assigned programmes</p>
              <p className="mt-1 text-2xl font-black">
                {assignments.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-black text-green-400">
                {completedCount}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-400">Remaining</p>
              <p className="mt-1 text-2xl font-black text-amber-300">
                {Math.max(0, assignments.length - completedCount)}
              </p>
            </div>
          </div>
        </section>

        {/* PROGRAMMES */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                Your work
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Assigned Programmes
              </h2>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-400">
              {assignments.length} programme
              {assignments.length === 1 ? "" : "s"}
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="text-xl font-bold">
                No programmes assigned
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Your assigned programmes will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment, index) => {
                const program = assignment.program;
                const isCompleted =
                  assignment.status === "SUBMITTED" ||
                  assignment.status === "COMPLETED" ||
                  assignment.status === "APPROVED";

                return (
                  <article
                    key={assignment.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-black text-blue-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          isCompleted
                            ? "bg-green-500/10 text-green-400"
                            : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Assigned"}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-black leading-snug text-white">
                      {program?.program_name ??
                        program?.name ??
                        "Programme"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {program?.program_code ?? program?.code ?? "—"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300">
                        {program?.category?.name ?? "No category"}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/judge/program/${encodeURIComponent(
                            assignment.programId
                          )}`
                        )
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500"
                    >
                      Open Programme
                      <span className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-800 py-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-slate-600">
            KALARGE 2K26 • Judge Management System
          </p>
        </footer>
      </div>
    </main>
  );
}