import { createClient } from "@supabase/supabase-js";

// Server-only: bypasses RLS entirely. Never import this from a Client
// Component or expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_*.
// This is how the app reads/writes all app tables — the browser never
// talks to Supabase directly except the Auth handshake (see server.ts).
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
