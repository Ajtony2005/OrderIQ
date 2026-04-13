interface HeaderProps {
  onProfile: () => void;
  onAdmin?: () => void;
  showAdmin?: boolean;
}

export function Header({ onProfile, onAdmin, showAdmin }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L5 7L9 11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 13L19 17L15 21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M5 7H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="leading-none">OrderIq</h1>
          <p className="text-sm text-gray-500 leading-none mt-0.5">Pénztár</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div>
          {new Date().toLocaleDateString("hu-HU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        {showAdmin && onAdmin && (
          <button
            onClick={onAdmin}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Admin
          </button>
        )}
        <button
          onClick={onProfile}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Profil megnyitása"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
