import { useEffect, useState } from "react";
import { ProfileEditForm } from "./profile/ProfileEditForm";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileMetaGrid } from "./profile/ProfileMetaGrid";
import { ProfileSummaryCard } from "./profile/ProfileSummaryCard";
import { ProfileViewUser } from "./profile/types";

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onUpdateProfile: (payload: { name: string }) => Promise<void>;
  user?: ProfileViewUser;
}

export function ProfileScreen({ onBack, onLogout, onUpdateProfile, user }: ProfileScreenProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("A nevnek legalabb 2 karakternek kell lennie.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onUpdateProfile({ name: trimmedName });
      setSuccessMessage("Profil sikeresen frissitve.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sikertelen profil frissites.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <ProfileHeader onBack={onBack} />
          <ProfileSummaryCard user={user ?? {}} displayName={name} />
          <ProfileMetaGrid user={user ?? {}} />
          <ProfileEditForm
            name={name}
            email={user?.email ?? ""}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onNameChange={setName}
            onSubmit={handleSave}
          />

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
