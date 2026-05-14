import { useQuery } from "@tanstack/react-query";

async function fetchLive() {
  const r = await fetch("/api/v1/health/live");
  if (!r.ok) throw new Error("live check failed");
  return r.json() as Promise<{ status: string }>;
}

async function fetchReady() {
  const r = await fetch("/api/v1/health/ready");
  if (r.status === 503) {
    return { status: "not_ready" as const };
  }
  if (!r.ok) throw new Error("ready check failed");
  return r.json() as Promise<{ status: string }>;
}

async function fetchMeta() {
  const r = await fetch("/api/v1/meta");
  if (!r.ok) throw new Error("meta failed");
  return r.json() as Promise<{
    version: string;
    build_id: string;
    env: string;
    service: string;
  }>;
}

function statusColor(ok: boolean | undefined, loading: boolean) {
  if (loading) return "text-slate-500";
  if (ok === undefined) return "text-slate-500";
  return ok ? "text-emerald-400" : "text-amber-400";
}

export function DashboardPage() {
  const live = useQuery({ queryKey: ["health", "live"], queryFn: fetchLive, refetchInterval: 15_000 });
  const ready = useQuery({ queryKey: ["health", "ready"], queryFn: fetchReady, refetchInterval: 15_000 });
  const meta = useQuery({ queryKey: ["meta"], queryFn: fetchMeta, refetchInterval: 60_000 });

  const readyOk = ready.data?.status === "ready";

  return (
    <div className="space-y-10">
      <header className="border-b border-po-line pb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Home</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Use <strong className="font-medium text-slate-300">Clusters</strong> for catalog work and{" "}
          <strong className="font-medium text-slate-300">Metrics</strong> for Prometheus text. This page summarizes
          runtime health and build metadata.
        </p>
      </header>

      <section className="rounded-2xl border border-po-line/90 bg-po-panel/40 p-6 shadow-lg shadow-black/20 sm:p-7">
        <h2 className="text-base font-semibold text-slate-100">Control plane status</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Liveness reflects the API process. Readiness adds a round-trip to the catalog database.
        </p>
        <p className="mt-3 text-xs font-mono text-slate-600">Health polls every 15s · meta every 60s</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-po-line bg-po-bg/45 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Liveness</dt>
            <dd className={`mt-3 text-xl font-mono font-medium ${statusColor(live.data?.status === "live", live.isLoading)}`}>
              {live.isLoading ? "…" : live.isError ? "error" : live.data?.status ?? "—"}
            </dd>
          </div>
          <div className="rounded-xl border border-po-line bg-po-bg/45 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Readiness</dt>
            <dd className={`mt-3 text-xl font-mono font-medium ${statusColor(readyOk === true, ready.isLoading)}`}>
              {ready.isLoading ? "…" : ready.isError ? "error" : ready.data?.status ?? "—"}
            </dd>
            {ready.data?.status === "not_ready" && (
              <p className="mt-3 text-xs leading-relaxed text-amber-200/90">
                Catalog DB unreachable from the API. Ensure Postgres is running (e.g.{" "}
                <code className="rounded bg-black/30 px-1 font-mono text-slate-300">control-db</code> in Compose).
              </p>
            )}
          </div>
          <div className="rounded-xl border border-po-line bg-po-bg/45 p-5 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Build</dt>
            <dd className="mt-3 space-y-2 font-mono text-sm text-slate-300">
              {meta.isLoading ? (
                <span className="text-slate-500">Loading…</span>
              ) : meta.isError ? (
                <span className="text-rose-400">Could not load meta</span>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500">version </span>
                    {meta.data?.version}
                  </div>
                  <div>
                    <span className="text-slate-500">build </span>
                    {meta.data?.build_id}
                  </div>
                  <div>
                    <span className="text-slate-500">env </span>
                    {meta.data?.env}
                  </div>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
