import type { Env } from "../types";

interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
}

export async function supabaseQuery<T>(
  env: Env,
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    single?: boolean;
  } = {},
): Promise<SupabaseResponse<T>> {
  const { method = "GET", body, headers = {}, single = false } = options;

  const url = `${env.SUPABASE_URL}/rest/v1/${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: single
        ? "return=representation, count=exact"
        : "return=representation",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { data: null, error: errorText };
  }

  const data = (await res.json()) as T;
  return { data, error: null };
}

export async function supabaseRpc<T>(
  env: Env,
  fnName: string,
  params: Record<string, unknown> = {},
): Promise<SupabaseResponse<T>> {
  const url = `${env.SUPABASE_URL}/rest/v1/rpc/${fnName}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { data: null, error: errorText };
  }

  const data = (await res.json()) as T;
  return { data, error: null };
}
