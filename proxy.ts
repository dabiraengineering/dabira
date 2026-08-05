import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic cookie-presence check only — a fast redirect for logged-out
// users. This is NOT the real authorization boundary: every gated page
// and every mutating Server Action/Route Handler independently calls
// requireStaffAuth()/requireApplicantAuth() (see lib/dal.ts), because
// proxy-based gating alone does not protect Server Actions in Next.js 16.
const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/account/login",
  "/account/signup",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginPath = pathname.startsWith("/account") ? "/account/login" : "/admin/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
