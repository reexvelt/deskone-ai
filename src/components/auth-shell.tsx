import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-mesh">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(600px_400px_at_50%_-10%,color-mix(in_oklab,var(--color-primary)_25%,transparent),transparent_60%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">AnchorSpace</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-gradient">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8 glass rounded-2xl p-6 shadow-2xl">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #3B82F6, #7C5CFF)",
        boxShadow: "0 8px 24px -8px rgba(59,130,246,0.55)",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M4 6h10a6 6 0 0 1 6 6v6H10a6 6 0 0 1-6-6V6Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="14" cy="12" r="1.5" fill="white" />
      </svg>
    </div>
  );
}
