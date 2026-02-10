import { ConvexClientProvider } from "@/components/convex-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
