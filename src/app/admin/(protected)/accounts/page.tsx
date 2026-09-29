"use client";

import { useCallback, useEffect, useState } from "react";

type AdminAccount = {
  id: string;
  name: string;
  username: string;
};

type JudgeAccount = {
  id: string;
  code: string;
  name: string;
  username: string;
  status: string;
};

export default function AccountsPage() {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [judges, setJudges] = useState<JudgeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [judgeInputs, setJudgeInputs] = useState<
    Record<string, { username: string; password: string }>
  >({});

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/accounts", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load accounts.");
      }

      setAdmin(data.admin);
      setAdminUsername(data.admin.username);
      setJudges(data.judges);

      const inputs: Record<
        string,
        { username: string; password: string }
      > = {};

      for (const judge of data.judges) {
        inputs[judge.id] = {
          username: judge.username,
          password: "",
        };
      }

      setJudgeInputs(inputs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load accounts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function updateAccount(
    accountType: "admin" | "judge",
    id: string,
    username: string,
    password: string,
    key: string
  ) {
    setSaving(key);
    setError("");
    setMessage("");

    try {
      const body: {
        accountType: "admin" | "judge";
        id: string;
        username?: string;
        password?: string;
      } = {
        accountType,
        id,
        username: username.trim(),
      };

      if (password) {
        body.password = password;
      }

      const response = await fetch("/api/admin/accounts/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update account.");
      }

      setMessage(data.message || "Account updated successfully.");

      if (data.requiresLogin) {
        window.location.href = "/admin/login";
        return;
      }

      await loadAccounts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update account."
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020817] p-8 text-center text-slate-400">
        Loading accounts...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-7">
        <header>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-sky-400">
            KALARGE 2K26
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Account Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage the admin and judge login credentials.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* ADMIN ACCOUNT */}
        <section className="rounded-2xl border border-slate-800 bg-[#081329] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Admin Account</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update your own admin login credentials.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!admin) return;

              void updateAccount(
                "admin",
                admin.id,
                adminUsername,
                adminPassword,
                "admin"
              );
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Admin Name
              </label>
              <input
                value={admin?.name ?? ""}
                disabled
                className="w-full rounded-xl border border-slate-700 bg-[#020817] px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                required
                minLength={3}
                autoComplete="username"
                className="w-full rounded-xl border border-slate-700 bg-[#020817] px-4 py-3 text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-slate-700 bg-[#020817] px-4 py-3 text-white outline-none focus:border-sky-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                At least 8 characters if changing the password.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving !== null}
              className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-[#001326] transition hover:bg-sky-400 disabled:opacity-50"
            >
              {saving === "admin" ? "Saving..." : "Save Admin Account"}
            </button>
          </form>
        </section>

        {/* JUDGE ACCOUNTS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Judge Accounts</h2>
            <p className="mt-1 text-sm text-slate-400">
              Update usernames and passwords for individual judges.
            </p>
          </div>

          {judges.map((judge) => {
            const inputs = judgeInputs[judge.id] ?? {
              username: judge.username,
              password: "",
            };

            return (
              <article
                key={judge.id}
                className="rounded-2xl border border-slate-800 bg-[#081329] p-5 sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 font-extrabold text-sky-400">
                      {judge.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{judge.name}</h3>
                      <p className="text-xs text-slate-400">{judge.code}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      judge.status === "ACTIVE"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                  >
                    {judge.status}
                  </span>
                </div>

                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void updateAccount(
                      "judge",
                      judge.id,
                      inputs.username,
                      inputs.password,
                      judge.id
                    );
                  }}
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Username
                    </label>
                    <input
                      value={inputs.username}
                      onChange={(event) =>
                        setJudgeInputs((previous) => ({
                          ...previous,
                          [judge.id]: {
                            ...inputs,
                            username: event.target.value,
                          },
                        }))
                      }
                      required
                      minLength={3}
                      autoComplete="off"
                      className="w-full rounded-xl border border-slate-700 bg-[#020817] px-4 py-3 text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={inputs.password}
                      onChange={(event) =>
                        setJudgeInputs((previous) => ({
                          ...previous,
                          [judge.id]: {
                            ...inputs,
                            password: event.target.value,
                          },
                        }))
                      }
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Leave blank to keep current password"
                      className="w-full rounded-xl border border-slate-700 bg-[#020817] px-4 py-3 text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={saving !== null}
                      className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-[#001326] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === judge.id ? "Saving..." : "Save Judge Account"}
                    </button>
                  </div>
                </form>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}