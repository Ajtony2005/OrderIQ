interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  user?: {
    name?: string;
    email?: string;
  };
}

export function ProfileScreen({ onBack, onLogout, user }: ProfileScreenProps) {
  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "OI";

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl">Profil</h2>
              <p className="text-gray-500 mt-1">Fiókadatok és beállítások.</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Vissza a pénztárhoz
            </button>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-semibold">
              {initials}
            </div>
            <div>
              <h3 className="text-xl">{user?.name ?? "Alex Johnson"}</h3>
              <p className="text-gray-500">{user?.email ?? "alex@orderiq.com"}</p>
              <p className="text-sm text-gray-400 mt-1">Barista • Üzlet #021</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Szerepkör</p>
              <p className="mt-2 font-medium">Műszakvezető</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Helyszín</p>
              <p className="mt-2 font-medium">Budapest - Központ</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Utolsó belépés</p>
              <p className="mt-2 font-medium">Ma, 08:42</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Státusz</p>
              <p className="mt-2 font-medium text-emerald-600">Aktív</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onLogout}
              className="px-6 py-3 rounded-xl text-white"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
