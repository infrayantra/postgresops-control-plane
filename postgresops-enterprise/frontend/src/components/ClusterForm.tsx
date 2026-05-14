import { useEffect, useId, useState } from "react";
import type { Cluster, ClusterCreatePayload } from "../api/types";
import { btnPrimary, btnSecondary, hintBase, inputBase, labelBase } from "../ui/styles";

const SSL_OPTIONS = ["disable", "allow", "prefer", "require", "verify-ca", "verify-full"] as const;

type FieldErrors = {
  name?: string;
  host?: string;
  port?: string;
  tags?: string;
};

type ClusterFormProps = {
  mode: "create" | "edit";
  initial?: Cluster | null;
  isPending: boolean;
  errorText?: string | null;
  onSubmit: (payload: ClusterCreatePayload | Partial<ClusterCreatePayload>) => void;
  onCancel: () => void;
  submitLabel: string;
};

function clusterToForm(c: Cluster) {
  return {
    name: c.name,
    environment: c.environment,
    host: c.host,
    port: String(c.port),
    database: c.database,
    ssl_mode: c.ssl_mode,
    tagsJson: JSON.stringify(c.tags ?? {}, null, 2),
    agent_id: c.agent_id ?? "",
  };
}

const emptyForm = {
  name: "",
  environment: "production",
  host: "",
  port: "5432",
  database: "postgres",
  ssl_mode: "prefer",
  tagsJson: "{}",
  agent_id: "",
};

export function ClusterForm({
  mode,
  initial,
  isPending,
  errorText,
  onSubmit,
  onCancel,
  submitLabel,
}: ClusterFormProps) {
  const [form, setForm] = useState(() =>
    mode === "edit" && initial ? clusterToForm(initial) : emptyForm
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formErrorId = useId();

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm(clusterToForm(initial));
      setFieldErrors({});
    }
  }, [mode, initial?.id]);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setFieldErrors((fe) => {
        const next = { ...fe };
        if (key === "name") delete next.name;
        if (key === "host") delete next.host;
        if (key === "port") delete next.port;
        if (key === "tagsJson") delete next.tags;
        return next;
      });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {};

    let tags: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(form.tagsJson || "{}") as unknown;
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        tags = parsed as Record<string, unknown>;
      } else {
        nextErrors.tags = "Tags must be a JSON object (not an array or string), for example {\"region\":\"us-east\"}.";
      }
    } catch {
      nextErrors.tags = "Invalid JSON. Use double quotes and a single object, for example {\"region\":\"us-east\"}.";
    }

    const port = Number(form.port);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      nextErrors.port = "Enter a TCP port between 1 and 65535.";
    }

    const name = form.name.trim();
    const host = form.host.trim();
    if (mode === "create") {
      if (!name) nextErrors.name = "Catalog name is required.";
      if (!host) nextErrors.host = "Hostname or IP is required.";
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    const base = {
      name,
      environment: form.environment.trim() || "production",
      host,
      port,
      database: form.database.trim() || "postgres",
      ssl_mode: form.ssl_mode,
      tags,
      agent_id: form.agent_id.trim() || null,
    };

    if (mode === "create") {
      onSubmit(base);
      return;
    }

    if (!initial) return;
    const patch: Partial<ClusterCreatePayload> = {};
    if (base.name !== initial.name) patch.name = base.name;
    if (base.environment !== initial.environment) patch.environment = base.environment;
    if (base.host !== initial.host) patch.host = base.host;
    if (base.port !== initial.port) patch.port = base.port;
    if (base.database !== initial.database) patch.database = base.database;
    if (base.ssl_mode !== initial.ssl_mode) patch.ssl_mode = base.ssl_mode;
    if (JSON.stringify(base.tags) !== JSON.stringify(initial.tags)) patch.tags = base.tags;
    const a = base.agent_id ?? null;
    const b = initial.agent_id ?? null;
    if (a !== b) patch.agent_id = a;

    if (Object.keys(patch).length === 0) {
      onCancel();
      return;
    }
    onSubmit(patch);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-describedby={errorText ? formErrorId : undefined}>
      {errorText ? (
        <div
          id={formErrorId}
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/35 px-4 py-3 text-sm text-rose-100"
        >
          {errorText}
        </div>
      ) : null}

      <fieldset className="space-y-4 rounded-xl border border-po-line/80 bg-po-bg/20 p-4 sm:p-5">
        <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Identity
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cluster-name" className={labelBase}>
              Catalog name <span className="text-rose-400/90">*</span>
            </label>
            <input
              id="cluster-name"
              className={`${inputBase} mt-1.5 font-mono`}
              value={form.name}
              onChange={set("name")}
              maxLength={128}
              autoComplete="off"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "err-name" : undefined}
            />
            {fieldErrors.name ? (
              <p id="err-name" className="mt-1.5 text-xs text-rose-300" role="alert">
                {fieldErrors.name}
              </p>
            ) : (
              <p className={`${hintBase} mt-1.5`}>Unique label in this control plane (letters, numbers, hyphen).</p>
            )}
          </div>
          <div>
            <label htmlFor="cluster-env" className={labelBase}>
              Environment
            </label>
            <input
              id="cluster-env"
              className={`${inputBase} mt-1.5`}
              value={form.environment}
              onChange={set("environment")}
              maxLength={64}
              placeholder="production"
              autoComplete="off"
            />
            <p className={`${hintBase} mt-1.5`}>Logical group: production, staging, lab, …</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-po-line/80 bg-po-bg/20 p-4 sm:p-5">
        <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Connection
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cluster-host" className={labelBase}>
              Host <span className="text-rose-400/90">*</span>
            </label>
            <input
              id="cluster-host"
              className={`${inputBase} mt-1.5 font-mono`}
              value={form.host}
              onChange={set("host")}
              placeholder="db.internal.example.com"
              maxLength={255}
              autoComplete="off"
              aria-invalid={!!fieldErrors.host}
              aria-describedby={fieldErrors.host ? "err-host" : undefined}
            />
            {fieldErrors.host ? (
              <p id="err-host" className="mt-1.5 text-xs text-rose-300" role="alert">
                {fieldErrors.host}
              </p>
            ) : (
              <p className={`${hintBase} mt-1.5`}>DNS name or IP as seen from the control plane container.</p>
            )}
          </div>
          <div>
            <label htmlFor="cluster-port" className={labelBase}>
              Port
            </label>
            <input
              id="cluster-port"
              type="number"
              min={1}
              max={65535}
              className={`${inputBase} mt-1.5 font-mono`}
              value={form.port}
              onChange={set("port")}
              aria-invalid={!!fieldErrors.port}
              aria-describedby={fieldErrors.port ? "err-port" : undefined}
            />
            {fieldErrors.port ? (
              <p id="err-port" className="mt-1.5 text-xs text-rose-300" role="alert">
                {fieldErrors.port}
              </p>
            ) : (
              <p className={`${hintBase} mt-1.5`}>PostgreSQL port (default 5432).</p>
            )}
          </div>
          <div>
            <label htmlFor="cluster-db" className={labelBase}>
              Database name
            </label>
            <input
              id="cluster-db"
              className={`${inputBase} mt-1.5 font-mono`}
              value={form.database}
              onChange={set("database")}
              maxLength={128}
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cluster-ssl" className={labelBase}>
              SSL mode
            </label>
            <select
              id="cluster-ssl"
              className={`${inputBase} mt-1.5`}
              value={form.ssl_mode}
              onChange={set("ssl_mode")}
            >
              {SSL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <p className={`${hintBase} mt-1.5`}>Matches libpq / client SSL options for future agents.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-po-line/80 bg-po-bg/20 p-4 sm:p-5">
        <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Metadata
        </legend>
        <div>
          <label htmlFor="cluster-tags" className={labelBase}>
            Tags (JSON object)
          </label>
          <textarea
            id="cluster-tags"
            rows={5}
            spellCheck={false}
            className={`${inputBase} mt-1.5 font-mono text-xs leading-relaxed`}
            value={form.tagsJson}
            onChange={set("tagsJson")}
            aria-invalid={!!fieldErrors.tags}
            aria-describedby={fieldErrors.tags ? "err-tags" : "hint-tags"}
          />
          {fieldErrors.tags ? (
            <p id="err-tags" className="mt-1.5 text-xs text-rose-300" role="alert">
              {fieldErrors.tags}
            </p>
          ) : (
            <p id="hint-tags" className={`${hintBase} mt-1.5`}>
              Arbitrary key/value metadata for dashboards and automation (not credentials).
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cluster-agent" className={labelBase}>
            Agent ID (optional)
          </label>
          <input
            id="cluster-agent"
            className={`${inputBase} mt-1.5 font-mono`}
            value={form.agent_id}
            onChange={set("agent_id")}
            maxLength={64}
            autoComplete="off"
          />
          <p className={`${hintBase} mt-1.5`}>Reserved for edge agent pairing in a later phase.</p>
        </div>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className={btnSecondary} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
