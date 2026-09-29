export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm tracking-[0.4em] text-gray-400">
          AHLUL QURAN STUDENTS ASSOCIATION
        </p>

        <h1 className="mt-6 text-7xl font-black tracking-tight">
          KALARGE
        </h1>

        <p className="mt-2 text-2xl font-semibold text-gray-300">
          2K26
        </p>

        <p className="mt-8 text-lg text-gray-400">
          Arts Fest Management System
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/admin"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Admin
          </a>

          <a
            href="/judge"
            className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10"
          >
            Judge
          </a>

          <a
            href="/results"
            className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10"
          >
            Public Results
          </a>

          <a
            href="/display"
            className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10"
          >
            Exhibition Display
          </a>
        </div>
      </div>
    </main>
  );
}