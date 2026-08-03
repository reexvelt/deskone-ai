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
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-secondary/25 blur-[110px]" />
          <div className="absolute bottom-[-8rem] right-[-4rem] h-[24rem] w-[24rem] rounded-full bg-primary/20 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-lg font-semibold tracking-tight">AnchorSpace</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-[2.75rem]">
              Your entire digital workspace.{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Connected.
              </span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Projects, content, clients, publishing and every tool you already use — organized in one calm,
              intelligent place.
            </p>
            <div className="mt-8 space-y-3">
              {["Connect the tools you already love", "One shared memory for every project", "Create, approve and publish in one flow"].map(
                (line) => (
                  <div key={line} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/50 px-4 py-3 backdrop-blur">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0 text-sm text-muted-foreground">{line}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AnchorSpace</p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex min-h-dvh flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute left-1/2 top-[-12rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-secondary/20 blur-[100px]" />
        </div>

        <div className="relative flex flex-1 flex-col justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-8">
          <div className="mx-auto w-full max-w-[26rem]">
            <Link to="/" className="mb-9 flex items-center gap-2.5 lg:hidden">
              <Logo size={34} />
              <span className="text-base font-semibold tracking-tight">AnchorSpace</span>
            </Link>

            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-7 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7C5CFF, #3B82F6)",
        boxShadow: "0 12px 30px -12px rgba(124,92,255,0.6)",
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h10a6 6 0 0 1 6 6v6H10a6 6 0 0 1-6-6V6Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="14" cy="12" r="1.5" fill="white" />
      </svg>
    </div>
  );
}
