"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import { Spinner } from "@/components/ui/spinner";

export default function WorkspacePage() {
  const router = useRouter();
  const { session, isPending } = useWorkspaceSync();

  React.useEffect(() => {
    if (!isPending && session) {
      router.replace("/workspace/my-canvas");
    } else if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return null;
}
