interface ProfileHeaderProps {
  onBack: () => void;
}

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
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
  );
}
