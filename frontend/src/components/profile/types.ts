export interface ProfileViewUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "staff";
  backendRole?: "ADMIN" | "USER" | "KITCHEN";
  providers?: Array<"PASSWORD" | "GOOGLE">;
  createdAt?: string;
  updatedAt?: string;
}
