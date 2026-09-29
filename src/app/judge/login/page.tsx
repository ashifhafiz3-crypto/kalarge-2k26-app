"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function JudgeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const judgeCode = searchParams.get("judge");

    if (judgeCode && /^J(0[1-9]|10)$/.test(judgeCode)) {
      setUsername(judgeCode);
    }
  }, [searchParams]);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/judge/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      router.replace("/judge");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
      >
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-blue-400">
            KALARGE 2K26
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Judge Login
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your assigned programmes.
          </p>
        </div>

        <label
          htmlFor="username"
          className="mb-2 block text-sm font-semibold text-slate-300"
        >
          Judge Code
        </label>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your judge code"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
        />

        <label
          htmlFor="password"
          className="mb-2 mt-5 block text-sm font-semibold text-slate-300"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
        />

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/judge")}
          className="mt-4 w-full rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Back to Judge Selection
        </button>
      </form>
    </main>
  );
}

export default function JudgeLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
          <p className="text-slate-300">Loading judge login...</p>
        </main>
      }
    >
      <JudgeLoginForm />
    </Suspense>
  );
}