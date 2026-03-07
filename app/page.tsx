import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Users, 
  Monitor,
  Sparkles,
  GitBranch,
  ArrowUpRight,
  MessageSquare
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 42.5L18 6L42.5 18L29.5 42.5H5.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M18 6L29.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M18 6V24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-xl">Excalidraw</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/workspace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Drawing</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Online <span className="italic">whiteboard</span> made simple
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                Ideate, Collaborate, Share. Simply with Excalidraw.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/workspace">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start drawing
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Try Excalidraw Plus
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-16 rounded-xl border bg-muted/50 overflow-hidden">
              <div className="h-8 bg-muted flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="aspect-video bg-background flex items-center justify-center">
                <div className="text-center">
                  <Pencil className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Your canvas awaits</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div>
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Pencil className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Create</h3>
                <p className="text-muted-foreground mb-4">
                  Simply designed to create perfect results fast. Elementary tools, advanced features and unlimited options with an infinite canvas.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✏️ Easy to use - Zero learning curve</li>
                  <li>📚 Libraries - Ready-to-use sketches</li>
                  <li>✨ Generative AI - It&apos;s dead simple</li>
                </ul>
              </div>

              <div>
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Collaborate</h3>
                <p className="text-muted-foreground mb-4">
                  Send link, get feedback and finish the idea together.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>🔗 Shareable link - Collaborate in real-time</li>
                  <li>🔐 Read-only link - Share content without scene access</li>
                  <li>👥 Team workspace - Work together seamlessly</li>
                </ul>
              </div>

              <div>
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Generative AI</h3>
                <p className="text-muted-foreground mb-4">
                  Create and visualize fast using Text to diagram and Wireframe to code generative features.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✏️ Text to diagram - Generate diagrams using chat</li>
                  <li>▶️ Wireframe to code - Generate mockups and more</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Common use cases
              </h2>
              <p className="text-muted-foreground">
                Meetings, Brainstorming, Diagrams, Interviews, Quick wireframing and more...
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border p-6 hover:shadow-md transition-shadow">
                <GitBranch className="h-8 w-8 mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">UML Diagram</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize and communicate different aspects of a system effectively
                </p>
                <Link href="#" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Read more <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border p-6 hover:shadow-md transition-shadow">
                <Monitor className="h-8 w-8 mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">Wireframe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A skeletal outline of a digital interface, focusing on content placement and functionality
                </p>
                <Link href="#" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Read more <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border p-6 hover:shadow-md transition-shadow">
                <MessageSquare className="h-8 w-8 mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">Presentation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use frames to create slides and share your ideas with a presentation
                </p>
                <Link href="#" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Read more <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                The easiest way to get your thoughts on screen
              </h2>
              <p className="text-muted-foreground mb-8">
                Quick drawings and mockups with a unique aesthetic. It&apos;s dead simple. We help you with intuitive shortcuts & command palette.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
              <div className="rounded-xl border bg-card p-6">
                <p className="text-lg mb-4">
                  &ldquo;Of all my favorite tools, @excalidraw would be the hardest to leave behind. I have terrible handwriting and never got to enjoy &lsquo;sketching&rsquo; before. Excalidraw unlocked that for me.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium text-sm">Theo - t3.gg</p>
                    <p className="text-xs text-muted-foreground">@t3dotgg</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <p className="text-lg mb-4">
                  &ldquo;Excalidraw is one of my favorite tools of all time. Made this diagram to clear up something in literally 90 seconds!&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium text-sm">Adam Wathan</p>
                    <p className="text-xs text-muted-foreground">@adamwathan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Something on your mind?
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                Simply start drawing!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/workspace">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Draw now
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Try Excalidraw Plus for free
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                14 days of free trial
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 42.5L18 6L42.5 18L29.5 42.5H5.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M18 6L29.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M18 6V24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
              <span className="font-semibold">Excalidraw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Blog</a>
              <a href="#" className="hover:text-foreground">Libraries</a>
              <a href="#" className="hover:text-foreground">Community</a>
              <a href="#" className="hover:text-foreground">Use Cases</a>
              <a href="#" className="hover:text-foreground">Security</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Excalidraw. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}