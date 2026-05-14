export type Cluster = {
  id: string;
  name: string;
  environment: string;
  host: string;
  port: number;
  database: string;
  ssl_mode: string;
  tags: Record<string, unknown>;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ClusterCreatePayload = {
  name: string;
  environment: string;
  host: string;
  port: number;
  database: string;
  ssl_mode: string;
  tags: Record<string, unknown>;
  agent_id?: string | null;
};

export type ClusterUpdatePayload = Partial<ClusterCreatePayload>;

export type ClusterProbeResult = {
  cluster_id: string;
  host: string;
  port: number;
  ok: boolean;
  latency_ms: number | null;
  error: string | null;
};

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    request_id?: string;
    fields?: unknown;
  };
};
