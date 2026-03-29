import type { Env } from "../types";
import { supabaseQuery } from "../services/supabase";

/**
 * Check if a wamid has already been processed.
 * Uses INSERT ... ON CONFLICT DO NOTHING.
 * Returns true if the message is NEW (should be processed).
 * Returns false if it's a DUPLICATE (should be skipped).
 */
export async function checkDedup(
  env: Env,
  wamid: string,
  phone: string,
): Promise<boolean> {
  const { data, error } = await supabaseQuery<Array<{ wamid: string }>>(
    env,
    "wa_message_log",
    {
      method: "POST",
      body: { wamid, phone },
      headers: {
        Prefer: "return=representation,resolution=ignore-duplicates",
      },
    },
  );

  if (error) {
    console.error("Dedup check failed:", error);
    // Fail open — process the message rather than silently dropping it
    return true;
  }

  // If data array is empty, the row already existed (duplicate)
  return Array.isArray(data) && data.length > 0;
}
