import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile · AnchorSpace" },
      { name: "description", content: "Manage your name, avatar and personal workspace preferences." },
      { property: "og:title", content: "Profile · AnchorSpace" },
      { property: "og:description", content: "Manage your name, avatar and personal workspace preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your identity across AnchorSpace.</p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-primary/40 to-secondary/40 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="rounded-full"
            onClick={() => {
              updateUser({ name, email });
              toast.success("Profile updated");
            }}
          >
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
