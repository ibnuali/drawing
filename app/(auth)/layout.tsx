import { ConvexClientProvider } from "@/components/convex-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
