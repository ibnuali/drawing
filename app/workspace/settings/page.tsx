"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, LogOut } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const initials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border/60 bg-background/80 sticky top-0 z-30 border-b px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/workspace/my-canvas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <span className="text-foreground text-sm font-semibold">Settings</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full text-lg font-medium">
                    {initials}
                  </div>
                )}
                <FieldGroup className="flex-1">
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      value={session.user.name}
                      disabled
                      className="bg-muted"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      value={session.user.email}
                      disabled
                      className="bg-muted"
                    />
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}