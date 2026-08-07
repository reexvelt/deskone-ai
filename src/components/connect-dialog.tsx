import { useEffect, useState } from "react";
import type { Integration } from "@/lib/store";
import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ExternalLink, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

/**
 * Guided connection flow: review permissions -> provider consent -> connected.
 * Mirrors a real OAuth handoff so the state machine matches production wiring.
 */
export function ConnectDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { beginConnect, authorizeIntegration, failIntegration } = useStore();
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (open) setAccount("");
  }, [open, integration?.id]);

  if (!integration) return null;
  const state = integration.connectionState ?? (integration.connected ? "connected" : "disconnected");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-left">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold text-primary-foreground"
              style={{ background: `linear-gradient(135deg, ${integration.accent ?? "#3B82F6"}, ${integration.accent ?? "#3B82F6"}cc)` }}
            >
              {integration.name[0]}
            </span>
            <span className="min-w-0 truncate">Connect {integration.name}</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            AnchorSpace will act on your behalf inside {integration.name}. You can revoke access at any time.
          </DialogDescription>
        </DialogHeader>

        <Stepper state={state} />

        {state === "error" && (
          <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{integration.errorMessage ?? "Authorization failed."}</span>
          </div>
        )}

        {state === "awaiting_oauth" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-surface/60 p-4 text-xs text-muted-foreground">
              We opened {integration.name}'s consent screen. Finish there, then confirm the account you approved.
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="connect-account" className="text-xs">
                Account you authorized
              </Label>
              <Input
                id="connect-account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={`you@${integration.name.toLowerCase().replace(/[^a-z]/g, "")}.com`}
                className="h-11 rounded-xl border-border bg-surface"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="eyebrow mb-2">Permissions requested</div>
              <ul className="space-y-1.5">
                {(integration.permissions?.length ? integration.permissions : ["read", "write"]).map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" /> <span className="font-mono">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            {integration.supportedActions?.length ? (
              <div>
                <div className="eyebrow mb-2">What AnchorSpace can do</div>
                <div className="flex flex-wrap gap-1">
                  {integration.supportedActions.map((a) => (
                    <span key={a} className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              if (state === "connecting" || state === "awaiting_oauth") failIntegration(integration.id);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          {state === "awaiting_oauth" ? (
            <Button
              className="rounded-full"
              disabled={!account.trim()}
              onClick={() => {
                authorizeIntegration(integration.id, account.trim());
                toast.success(`${integration.name} connected`);
                onOpenChange(false);
              }}
            >
              <Check className="mr-1 h-4 w-4" /> Confirm connection
            </Button>
          ) : (
            <Button className="rounded-full" disabled={state === "connecting"} onClick={() => beginConnect(integration.id)}>
              {state === "connecting" ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Opening {integration.name}…
                </>
              ) : (
                <>
                  <ExternalLink className="mr-1 h-4 w-4" /> Continue to {integration.name}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ state }: { state: NonNullable<Integration["connectionState"]> }) {
  const index = state === "connected" ? 2 : state === "awaiting_oauth" ? 1 : 0;
  const steps = ["Review access", "Authorize", "Connected"];
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
              i <= index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i < index ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className={`truncate text-[11px] ${i <= index ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
