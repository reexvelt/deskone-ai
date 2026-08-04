import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { storePendingReferral } from "@/lib/referrals";
import { Logo } from "@/components/auth-shell";

export const Route = createFileRoute("/invite/$code")({
  head: () => ({
    meta: [
      { title: "Your AnchorSpace invite" },
      {
        name: "description",
        content: "Accept your AnchorSpace invite and start with 100 welcome AI credits.",
      },
      { property: "og:title", content: "Your AnchorSpace invite" },
      {
        property: "og:description",
        content: "Accept your AnchorSpace invite and start with 100 welcome AI credits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InviteLanding,
});

function InviteLanding() {
  const { code } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    storePendingReferral(code);
    navigate({ to: "/register", replace: true });
  }, [code, navigate]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <Logo size={44} />
        <h1 className="text-lg font-semibold tracking-tight">Applying your invite…</h1>
        <p className="text-sm text-muted-foreground">Taking you to sign up.</p>
      </div>
    </main>
  );
}
