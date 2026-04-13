import { ProfileViewUser } from "./types";

interface ProfileMetaGridProps {
  user: ProfileViewUser;
}

function formatRole(user: ProfileViewUser): string {
  if (user.backendRole === "ADMIN" || user.role === "admin") {
    return "Admin";
  }

  if (user.backendRole === "KITCHEN") {
    return "Konyha";
  }

  if (user.backendRole === "USER") {
    return "Felhasználó";
  }

  if (user.role === "staff") {
    return "Személyzet";
  }

  return "-";
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function ProfileMetaGrid({ user }: ProfileMetaGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-6">
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Role</p>
        <p className="mt-2 font-medium">{formatRole(user)}</p>
      </div>
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Profil létrehozva</p>
        <p className="mt-2 font-medium">{formatDate(user.createdAt)}</p>
      </div>
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Utoljára frissítve</p>
        <p className="mt-2 font-medium">{formatDate(user.updatedAt)}</p>
      </div>
    </div>
  );
}
