import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { readJsonError } from "../api/client";
import type { Cluster, ClusterCreatePayload, ClusterProbeResult } from "../api/types";
import { ClusterForm } from "../components/ClusterForm";
import { Modal } from "../components/Modal";
import { btnPrimary, btnSecondary, btnTable } from "../ui/styles";

async function fetchClusters(): Promise<Cluster[]> {
  const r = await fetch("/api/v1/clusters");
  if (!r.ok) throw new Error(await readJsonError(r));
  return r.json();
}

type Banner = { tone: "success" | "info"; message: string };

export function FleetPage() {
  const queryClient = useQueryClient();
  const q = useQuery({ queryKey: ["clusters"], queryFn: fetchClusters });

  const sorted = useMemo(() => {
    const list = q.data ?? [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [q.data]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [editTarget, setEditTarget] = useState<Cluster | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cluster | null>(null);
  const [probeResult, setProbeResult] = useState<ClusterProbeResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const createMut = useMutation({
    mutationFn: async (payload: ClusterCreatePayload) => {
      const r = await fetch("/api/v1/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await readJsonError(r));
      return r.json() as Promise<Cluster>;
    },
    onSuccess: () => {
      setCreateOpen(false);
      setFormError(null);
      setBanner({ tone: "success", message: "Cluster created and saved to the catalog." });
      void queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const patchMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<ClusterCreatePayload> }) => {
      const r = await fetch(`/api/v1/clusters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await readJsonError(r));
      return r.json() as Promise<Cluster>;
    },
    onSuccess: () => {
      setEditTarget(null);
      setFormError(null);
      setBanner({ tone: "success", message: "Cluster updated." });
      void queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/v1/clusters/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await readJsonError(r));
    },
    onSuccess: () => {
      setDeleteTarget(null);
      setBanner({ tone: "success", message: "Cluster removed from the catalog." });
      void queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
  });

  const probeMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/v1/clusters/${id}/probe`, { method: "POST" });
      if (!r.ok) throw new Error(await readJsonError(r));
      return r.json() as Promise<ClusterProbeResult>;
    },
    onSuccess: (data) => setProbeResult(data),
    onError: (e: Error, id) => {
      setProbeResult({
        cluster_id: id,
        host: "—",
        port: 0,
        ok: false,
        latency_ms: null,
        error: e.message,
      });
    },
  });

  const openCreate = () => {
    setFormError(null);
    setCreateFormKey((k) => k + 1);
    setCreateOpen(true);
  };

  return (
    <div className="space-y-8">
      {banner ? (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            banner.tone === "success"
              ? "border-emerald-500/35 bg-emerald-950/25 text-emerald-100"
              : "border-sky-500/35 bg-sky-950/20 text-sky-100"
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <header className="flex flex-col gap-4 border-b border-po-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Fleet</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Cluster directory</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Register PostgreSQL connection targets in the catalog. <strong className="font-medium text-slate-300">TCP check</strong>{" "}
            verifies TCP reachability from the control plane (not database authentication).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={() => void queryClient.invalidateQueries({ queryKey: ["clusters"] })} disabled={q.isFetching} className={btnSecondary}>
            {q.isFetching ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" onClick={openCreate} className={btnPrimary}>
            Add cluster
          </button>
        </div>
      </header>

      {q.isLoading && (
        <div
          className="rounded-2xl border border-po-line bg-po-panel/50 px-6 py-16 text-center"
          role="status"
          aria-busy="true"
        >
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
          <p className="text-sm text-slate-400">Loading catalog…</p>
        </div>
      )}

      {q.isError && (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 px-5 py-4 text-sm text-rose-100" role="alert">
          <p className="font-medium text-rose-50">Could not load clusters</p>
          <p className="mt-2 text-rose-200/90 leading-relaxed">
            Confirm the API and catalog database are running, then choose <strong className="font-medium">Refresh</strong>.
          </p>
        </div>
      )}

      {!q.isLoading && !q.isError && (
        <div className="overflow-hidden rounded-2xl border border-po-line bg-po-panel/30 shadow-xl shadow-black/25">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-po-line bg-po-bg/50 px-4 py-3 sm:px-5">
            <p className="text-sm text-slate-400">
              <span className="font-mono text-slate-300">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "cluster" : "clusters"}
              <span className="mx-2 text-po-line">·</span>
              <span className="text-slate-500">sorted by name</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Registered PostgreSQL clusters</caption>
              <thead className="sticky top-0 z-[1] border-b border-po-line bg-po-bg/95 backdrop-blur-sm">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="whitespace-nowrap px-4 py-3 sm:px-5">
                    Name
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 sm:px-5">
                    Environment
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 sm:px-5">
                    Endpoint
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 sm:px-5">
                    Database
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 sm:px-5">
                    SSL
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right sm:px-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-po-line">
                {sorted.length ? (
                  sorted.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-white/[0.04] ${i % 2 === 1 ? "bg-black/10" : ""}`}
                    >
                      <th scope="row" className="px-4 py-3.5 font-semibold text-slate-100 sm:px-5">
                        {c.name}
                      </th>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 sm:px-5">{c.environment}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-sky-300 sm:px-5">
                        {c.host}:{c.port}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-300 sm:px-5">{c.database}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 sm:px-5">{c.ssl_mode}</td>
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className={`${btnTable} border-sky-500/25 hover:border-sky-500/50 hover:text-sky-200`}
                            disabled={probeMut.isPending}
                            aria-busy={probeMut.isPending && probeMut.variables === c.id}
                            onClick={() => void probeMut.mutateAsync(c.id)}
                          >
                            {probeMut.isPending && probeMut.variables === c.id ? "Checking…" : "TCP check"}
                          </button>
                          <button
                            type="button"
                            className={`${btnTable} hover:border-amber-500/40 hover:text-amber-200`}
                            onClick={() => {
                              setFormError(null);
                              setEditTarget(c);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${btnTable} border-rose-500/25 text-rose-200/90 hover:border-rose-500/50 hover:bg-rose-950/30`}
                            onClick={() => {
                              deleteMut.reset();
                              setDeleteTarget(c);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto max-w-md space-y-4">
                        <p className="text-base font-medium text-slate-200">No clusters in the catalog</p>
                        <p className="text-sm leading-relaxed text-slate-400">
                          Add a connection target to start tracking hosts and ports from this console.
                        </p>
                        <button type="button" onClick={openCreate} className={btnPrimary}>
                          Add your first cluster
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <aside className="rounded-xl border border-po-line/80 bg-po-bg/30 px-4 py-3 text-xs leading-relaxed text-slate-500">
        <strong className="font-medium text-slate-400">Security:</strong> passwords and client certificates are never
        stored in the catalog. Use a secret manager before production.
      </aside>

      <Modal
        title="Add cluster"
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setFormError(null);
        }}
        wide
      >
        <ClusterForm
          key={createFormKey}
          mode="create"
          isPending={createMut.isPending}
          errorText={formError}
          submitLabel="Create cluster"
          onCancel={() => {
            setCreateOpen(false);
            setFormError(null);
          }}
          onSubmit={(p) => createMut.mutate(p as ClusterCreatePayload)}
        />
      </Modal>

      <Modal
        title={editTarget ? `Edit · ${editTarget.name}` : "Edit cluster"}
        isOpen={!!editTarget}
        onClose={() => {
          setEditTarget(null);
          setFormError(null);
        }}
        wide
      >
        {editTarget ? (
          <ClusterForm
            key={editTarget.id}
            mode="edit"
            initial={editTarget}
            isPending={patchMut.isPending}
            errorText={formError}
            submitLabel="Save changes"
            onCancel={() => {
              setEditTarget(null);
              setFormError(null);
            }}
            onSubmit={(patch) =>
              patchMut.mutate({ id: editTarget.id, body: patch as Partial<ClusterCreatePayload> })
            }
          />
        ) : null}
      </Modal>

      <Modal
        title="Remove cluster"
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          deleteMut.reset();
        }}
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setDeleteTarget(null);
                deleteMut.reset();
              }}
              disabled={deleteMut.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:opacity-50"
              disabled={deleteMut.isPending}
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              {deleteMut.isPending ? "Removing…" : "Remove from catalog"}
            </button>
          </div>
        }
      >
        {deleteTarget ? (
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Remove{" "}
              <strong className="font-mono text-sky-300">{deleteTarget.name}</strong>
              <span className="text-slate-500"> · </span>
              <span className="font-mono text-slate-400">
                {deleteTarget.host}:{deleteTarget.port}
              </span>{" "}
              from the catalog? This cannot be undone.
            </p>
            {deleteMut.isError ? (
              <p className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-rose-200" role="alert">
                {(deleteMut.error as Error).message}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        title="TCP connectivity"
        isOpen={!!probeResult}
        onClose={() => setProbeResult(null)}
        variant="subtle"
      >
        {probeResult ? (
          <div className="space-y-4 text-sm">
            {probeResult.host !== "—" ? (
              <p className="font-mono text-base text-slate-200">
                {probeResult.host}
                <span className="text-slate-500">:</span>
                <span className="text-sky-300">{probeResult.port}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500">Result</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                  probeResult.ok
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
                }`}
              >
                {probeResult.ok ? "Reachable" : "Not reachable"}
              </span>
            </div>
            {probeResult.latency_ms != null ? (
              <p className="font-mono text-slate-400">
                Round-trip (TCP handshake): <span className="text-slate-200">{probeResult.latency_ms} ms</span>
              </p>
            ) : null}
            {probeResult.error ? (
              <p className="rounded-lg border border-amber-500/35 bg-amber-950/25 px-3 py-2 font-mono text-xs leading-relaxed text-amber-100">
                {probeResult.error}
              </p>
            ) : null}
            <p className="text-xs leading-relaxed text-slate-500">
              This check opens a TCP socket only; it does not perform PostgreSQL authentication or TLS negotiation.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
