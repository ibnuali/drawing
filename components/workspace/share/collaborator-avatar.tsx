"use client";

import { cn, getInitials } from "@/lib/utils";

interface CollaboratorAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
}

export function CollaboratorAvatar({
  name,
  avatarUrl,
  className,
}: Readonly<CollaboratorAvatarProps>) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
        avatarUrl ? "" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}