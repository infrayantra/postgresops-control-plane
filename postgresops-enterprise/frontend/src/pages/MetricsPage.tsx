import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { btnPrimary, btnSecondary } from "../ui/styles";

async function fetchMetrics(): Promise<string> {
  const r = await fetch("/metrics");
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

export function MetricsPage() {
  const q = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 15_000,
  });

  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const copy = async () => {
    if (!q.data) return;
    try {
      await navigator.clipboard.writeText(q.data);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2500);
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-po-line pb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Observability</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Prometheus metrics</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Exposition format for scraping. Configure Prometheus to pull{" "}
          <code className="rounded bg-po-bg/80 px-1.5 py-0.5 font-mono text-xs text-sky-300">/metrics</code> on this
          same origin as the UI.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void q.refetch()} disabled={q.isFetching} className={btnSecondary}>
          {q.isFetching ? "Refreshing…" : "Refresh now"}
        </button>
        <button type="button" onClick={() => void copy()} disabled={!q.data} className={btnPrimary}>
          Copy to clipboard
        </button>
        {copyState === "copied" ? (
          <span className="text-xs font-medium text-emerald-400" role="status">
            Copied
          </span>
        ) : null}
        {copyState === "error" ? (
          <span className="text-xs font-medium text-rose-400" role="alert">
            Clipboard unavailable
          </span>
        ) : null}
      </div>

      {q.isError ? (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/25 px-4 py-3 text-sm text-rose-100" role="alert">
          Could not load metrics: {(q.error as Error).message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-po-line bg-po-bg/40 shadow-inner shadow-black/20">
        <div className="border-b border-po-line bg-po-panel/50 px-4 py-2 text-xs font-mono text-slate-500">text/plain</div>
        <pre
          className="max-h-[min(70vh,640px)] overflow-auto p-4 text-[11px] font-mono leading-relaxed text-slate-300 [tab-size:2]"
          aria-label="Prometheus metrics output"
        >
          {q.isLoading ? (
            <span className="text-slate-500">Loading metrics…</span>
          ) : (
            q.data ?? ""
          )}
        </pre>
      </div>
    </div>
  );
}
