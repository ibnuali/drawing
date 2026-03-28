"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function WorkspacePage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/workspace/my-canvas");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}