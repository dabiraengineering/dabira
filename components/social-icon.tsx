import { Globe } from "lucide-react";

// lucide-react removed brand/logo glyphs entirely (trademarked marks are
// out of scope for that icon set) — small inline SVGs for the platforms
// Dabira actually links to, plus a couple of common extras.
type IconProps = { className?: string };

const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.62c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
  </svg>
);

const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.6 5.82c-1.02-.88-1.6-2.15-1.6-3.5h-3.15v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6.05.87.13V9.44a5.9 5.9 0 0 0-.87-.06 6 6 0 1 0 6 6V9.9a7.2 7.2 0 0 0 4.15 1.31V8.06a4.8 4.8 0 0 1-2.5-.87Z" />
  </svg>
);

const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.36C16.3 4.25 15.34 4.15 14.22 4.15c-2.34 0-3.94 1.43-3.94 4.05V10.5H7.75v3h2.53V21h3.22Z" />
  </svg>
);

const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 4h4.2l4.1 5.7L16.9 4H20l-6.3 7.7L20.4 20H16.2l-4.5-6.2L6.9 20H3.8l6.7-8.2L4 4Z" />
  </svg>
);

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  twitter: XIcon,
  x: XIcon,
  tiktok: TikTokIcon,
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const Icon = ICONS[platform.toLowerCase()] ?? Globe;
  return <Icon className={className} />;
}
