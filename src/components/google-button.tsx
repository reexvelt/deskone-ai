import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GoogleButton({
  onClick,
  label = "Continue with Google",
}: {
  onClick: () => Promise<void>;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Google sign-in failed");
          setLoading(false);
        }
      }}
      className="h-12 w-full rounded-full border-border bg-surface/60 text-sm font-medium hover:bg-surface"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" className="mr-2 shrink-0" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.7 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.2l-6.2-5c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.4 39.6 16.1 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5c-.4.4 6.6-4.8 6.6-14.6 0-1.2-.1-2.3-.4-3.5Z" />
    </svg>
  );
}
