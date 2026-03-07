"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { BadgeCheckIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const initials = session?.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              {session?.user.image ? (
                <AvatarImage
                  src={session?.user.image}
                  alt={session?.user.name}
                />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/workspace/settings")}>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
