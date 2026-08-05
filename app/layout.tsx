import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display face for headings on the public marketing site —
// distinct from the sans body/UI font used everywhere else, incl. admin.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Dabira Projects",
  description: "Paid research study participant recruitment in NYC.",
};

// Given a hex color, pick black or white for readable contrast on top of it
// (simple relative-luminance heuristic — good enough for a single brand
// accent color, not a full WCAG contrast solver).
function contrastForeground(hex: string): string {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return "oklch(1 0 0)";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "oklch(0.145 0 0)" : "oklch(1 0 0)";
}

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

// A brand color tuned for readability on white often looks muddy/flat on
// pure black — dark UIs generally need more lightness and saturation for
// an accent to keep its "pop". Lighten + saturate a bit for the .dark
// variant rather than reusing the light-mode hex verbatim.
function brightenForDark(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, Math.min(s + 12, 85), Math.min(l + 18, 68));
}

async function getPrimaryColor(): Promise<string | null> {
  try {
    const db = createServiceRoleClient();
    const { data } = await db
      .from("site_settings")
      .select("primary_color_hex")
      .single();
    return data?.primary_color_hex ?? null;
  } catch {
    // A Supabase hiccup should degrade to the default theme, never take
    // down the whole site — this fetch runs on every single page.
    return null;
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const primaryColorHex = await getPrimaryColor();

  const themeStyle = primaryColorHex
    ? ({
        "--primary": primaryColorHex,
        "--primary-foreground": contrastForeground(primaryColorHex),
        "--sidebar-primary": primaryColorHex,
        "--sidebar-primary-foreground": contrastForeground(primaryColorHex),
      } as React.CSSProperties)
    : undefined;

  const darkPrimary = primaryColorHex ? brightenForDark(primaryColorHex) : null;
  const darkPrimaryForeground = darkPrimary ? contrastForeground(darkPrimary) : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      style={themeStyle}
    >
      {darkPrimary && (
        <head>
          <style>{`.dark { --primary: ${darkPrimary}; --primary-foreground: ${darkPrimaryForeground}; --sidebar-primary: ${darkPrimary}; --sidebar-primary-foreground: ${darkPrimaryForeground}; }`}</style>
        </head>
      )}
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
