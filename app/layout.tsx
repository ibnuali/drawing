import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xdraw.web.id";

export const metadata: Metadata = {
  title: {
    default: "Xdraw - Collaborative Whiteboard",
    template: "%s | Xdraw",
  },
  description:
    "Xdraw is a free virtual whiteboard for sketching ideas, wireframing, and collaborating with your team in real-time. Create infinite canvases and share them instantly.",
  keywords: [
    "whiteboard",
    "drawing",
    "collaborative",
    "sketching",
    "wireframing",
    "real-time collaboration",
    "virtual whiteboard",
    "online drawing",
    "team collaboration",
    "excalidraw",
  ],
  authors: [{ name: "Xdraw Team" }],
  creator: "Xdraw",
  publisher: "Xdraw",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Xdraw",
    title: "Xdraw - Collaborative Whiteboard",
    description:
      "Free virtual whiteboard for sketching ideas and collaborating with your team in real-time.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xdraw - Collaborative Whiteboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xdraw - Collaborative Whiteboard",
    description:
      "Free virtual whiteboard for sketching ideas and collaborating with your team in real-time.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
