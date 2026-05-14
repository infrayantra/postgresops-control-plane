import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Home", hint: "Health & build" },
  { to: "/fleet", label: "Clusters", hint: "Catalog CRUD" },
  { to: "/metrics", label: "Metrics", hint: "Prometheus" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "group relative min-w-[9rem] rounded-xl border px-4 py-2.5 text-left transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/50",
    isActive
      ? "border-sky-500/45 bg-sky-500/12 text-sky-50 shadow-md shadow-sky-950/30"
      : "border-transparent bg-po-bg/35 text-slate-400 hover:border-po-line hover:bg-white/[0.03] hover:text-slate-200",
  ].join(" ");

export function AppLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-po-line bg-po-panel/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-sky-400/90">PostgresOps</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Control Plane</h1>
            <p className="text-sm leading-relaxed text-slate-400">
              Fleet catalog, health, metrics, and operations in one console—no separate API client required for
              day-to-day work.
            </p>
          </div>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Primary">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-sky-400/90"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative block text-sm font-semibold">{item.label}</span>
                    <span className="relative mt-0.5 block text-[11px] font-normal text-slate-500 group-hover:text-slate-400">
                      {item.hint}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
        <Outlet />
      </main>
      <footer className="border-t border-po-line bg-po-bg/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <span>PostgresOps Control Plane · Docker service: control-plane · catalog often :55432</span>
          <span className="text-slate-600">
            Optional:{" "}
            <a href="/docs" className="text-sky-500/90 underline-offset-2 hover:text-sky-400 hover:underline">
              Swagger
            </a>
            <span className="mx-1.5 text-slate-600">·</span>
            <a href="/redoc" className="text-sky-500/90 underline-offset-2 hover:text-sky-400 hover:underline">
              ReDoc
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
