/** Shared interaction styles for consistent, accessible controls. */

export const inputBase =
  "w-full rounded-lg border bg-po-bg/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition-colors " +
  "border-po-line focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-[invalid=true]:border-rose-500/50 aria-[invalid=true]:ring-rose-500/15";

export const labelBase = "block text-xs font-medium uppercase tracking-wider text-slate-400";

export const hintBase = "text-xs text-slate-500 leading-snug";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white " +
  "shadow-sm shadow-sky-950/30 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 " +
  "disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-po-line bg-po-bg/60 px-4 py-2.5 text-sm font-medium text-slate-200 " +
  "hover:border-slate-500/40 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 " +
  "disabled:pointer-events-none disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white " +
  "hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 " +
  "disabled:pointer-events-none disabled:opacity-50";

export const btnTable =
  "rounded-md border border-po-line px-2.5 py-1.5 text-xs font-medium text-slate-300 " +
  "hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500/50 " +
  "disabled:pointer-events-none disabled:opacity-40";
