import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Client-side auth check; redirect to home if authed, else to login.
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("deskone.user");
      if (raw) throw redirect({ to: "/home" });
      throw redirect({ to: "/login" });
    }
  },
  component: () => null,
});
