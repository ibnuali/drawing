import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Users,
  Shield,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 42.5L18 6L42.5 18L29.5 42.5H5.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M18 6L29.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M18 6V24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold text-lg">xdraw</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
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

            <div className="mt-16 rounded-lg border overflow-hidden max-w-4xl mx-auto">
              <div className="h-7 bg-muted/50 flex items-center gap-1.5 px-3 border-b">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
                <Pencil className="h-12 w-12 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Pencil className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">Create</h3>
                <p className="text-sm text-muted-foreground">
                  Infinite canvas with simple tools. Zero learning curve.
                </p>
              </div>

              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">Collaborate</h3>
                <p className="text-sm text-muted-foreground">
                  Share a link and work together in real-time.
                </p>
              </div>

              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  End-to-end encryption for your private canvases.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-3">
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
              <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 42.5L18 6L42.5 18L29.5 42.5H5.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M18 6L29.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M18 6V24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium">xdraw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="hover:text-foreground transition-colors">Docs</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} xdraw
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}