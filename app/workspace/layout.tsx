import { ConvexClientProvider } from "@/components/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceLayoutClient } from "@/components/workspace/layout/workspace-layout-client";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <TooltipProvider>
        <WorkspaceLayoutClient>{children}</WorkspaceLayoutClient>
      </TooltipProvider>
    </ConvexClientProvider>
  );
}
