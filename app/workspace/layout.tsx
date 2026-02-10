import { ConvexClientProvider } from "@/components/convex-provider";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
