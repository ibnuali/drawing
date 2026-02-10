import { ConvexClientProvider } from "@/components/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ConvexClientProvider>
  );
}
