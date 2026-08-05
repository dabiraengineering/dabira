import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Auth-only client for the admin login handshake (Server Components,
// Server Actions, Route Handlers). Runs under RLS via the anon key — app
// data reads/writes go through service-role.ts instead.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render — the proxy already
            // refreshes the session on the request path, so this is safe
            // to ignore here.
          }
        },
      },
    }
  );
}
