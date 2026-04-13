interface ProfileEditFormProps {
  name: string;
  email: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ProfileEditForm({
  name,
  email,
  isSubmitting,
  errorMessage,
  successMessage,
  onNameChange,
  onSubmit,
}: ProfileEditFormProps) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="rounded-2xl border border-gray-200 p-4 block">
        <span className="text-sm text-gray-500">Név</span>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
          placeholder="Teljes név"
        />
      </label>

      <label className="rounded-2xl border border-gray-200 p-4 block">
        <span className="text-sm text-gray-500">E-mail (nem módosítható)</span>
        <input
          value={email}
          readOnly
          className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 text-gray-500"
        />
      </label>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-white disabled:opacity-70"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          {isSubmitting ? "Mentés..." : "Profil mentés"}
        </button>
      </div>
    </form>
  );
}
