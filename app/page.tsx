import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XdrawIcon } from "@/components/xdraw-icon";
import {
  Pencil,
  Users,
  FolderOpen,
  ArrowRight
} from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Xdraw",
  description:
    "Free virtual whiteboard for sketching ideas and collaborating with your team in real-time.",
  url: "https://xdraw.web.id",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Infinite canvas",
    "Real-time collaboration",
    "Share by link",
    "Export to PNG, SVG",
    "Dark mode",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" aria-label="Xdraw home">
            <XdrawIcon className="h-6 w-6" aria-hidden="true" />
            <span className="font-semibold text-lg">Xdraw</span>
          </a>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-3">
              <li>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
              </li>
              <li>
                <Link href="/sign-up">
                  <Button size="sm">Get started</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 md:pt-40 md:pb-28" aria-labelledby="hero-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Draw. Collaborate. Ship.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                The virtual whiteboard for sketching ideas with your team.
              </p>
              <Link href="/workspace">
                <Button size="lg" className="h-11 px-6">
                  Start drawing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <figure className="mt-16 rounded-lg border overflow-hidden max-w-4xl mx-auto">
              <div className="h-7 bg-muted/50 flex items-center gap-1.5 px-3 border-b">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
                <Pencil className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
              </div>
            </figure>
          </div>
        </section>

        <section className="py-20 border-t" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <h2 id="features-heading" className="sr-only">Features</h2>
            <ul className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto" role="list">
              <li className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-medium mb-2">Create</h3>
                <p className="text-sm text-muted-foreground">
                  Infinite canvas with simple tools. Zero learning curve.
                </p>
              </li>

              <li className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-medium mb-2">Collaborate</h3>
                <p className="text-sm text-muted-foreground">
                  Share a link and work together in real-time.
                </p>
              </li>

              <li className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-medium mb-2">Organize</h3>
                <p className="text-sm text-muted-foreground">
                  Group canvases into categories. Stay organized.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="py-20 border-t" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 id="cta-heading" className="text-2xl font-bold mb-3">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-6">
                Free forever for personal use. No credit card required.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="h-11 px-6">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <XdrawIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Xdraw</span>
            </div>
            <nav aria-label="Footer navigation">
              <ul className="flex items-center gap-6 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Xdraw
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}