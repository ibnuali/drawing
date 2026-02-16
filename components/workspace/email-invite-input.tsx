"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/utils";

interface EmailInviteInputProps {
  canvasId: Id<"canvases">;
}

export function EmailInviteInput({ canvasId }: EmailInviteInputProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const convex = useConvex();
  const addCollaborator = useMutation(api.access.addCollaborator);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch user by email on-demand instead of reactively
      const user = await convex.query(api.users.getUserByEmail, {
        email: trimmedEmail,
      });

      if (!user) {
        setError("No user found with this email. They must sign up first.");
        return;
      }

      await addCollaborator({
        canvasId,
        userId: user.id,
        accessLevel: "editor",
      });

      setEmail("");
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add collaborator";
      if (message.includes("already has access")) {
        setError("This person already has access to this canvas");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          className="flex-1 max-sm:min-h-[44px]"
        />
        <Button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="max-sm:min-h-[44px]"
        >
          {isSubmitting ? "Adding..." : "Invite"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
