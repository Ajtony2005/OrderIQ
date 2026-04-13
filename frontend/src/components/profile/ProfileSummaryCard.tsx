import { ProfileViewUser } from "./types";

interface ProfileSummaryCardProps {
  user: ProfileViewUser;
  displayName: string;
}

function mapRoleLabel(role?: "ADMIN" | "USER" | "KITCHEN"): string {
  if (role === "ADMIN") {
    return "Admin";
  }

  if (role === "KITCHEN") {
    return "Konyha";
  }

  return "Felhasználó";
}

export function ProfileSummaryCard({ user, displayName }: ProfileSummaryCardProps) {
  const initials =
    displayName
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "OI";

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-semibold">
        {initials}
      </div>
      <div>
        <h3 className="text-xl">{displayName || "Névtelen felhasználó"}</h3>
        <p className="text-gray-500">{user.email ?? "-"}</p>
        <p className="text-sm text-gray-400 mt-1">{mapRoleLabel(user.backendRole)}</p>
      </div>
    </div>
  );
}
