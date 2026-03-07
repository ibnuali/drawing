export interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  accessLevel: "owner" | "editor" | "viewer";
  avatarUrl?: string;
}