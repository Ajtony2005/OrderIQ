import { AppLayout } from "../components/AppLayout";
import { ProfileScreen } from "../components/ProfileScreen";
import { useUpdateProfileMutation } from "../api/profile";
import { type AuthSessionUser } from "../services/authService";

interface ProfilePageProps {
  user: AuthSessionUser;
  onBack: () => void;
  onLogout: () => void;
  onUserUpdated: (user: AuthSessionUser) => void;
  onProfile: () => void;
  onAdmin: () => void;
  showAdmin: boolean;
}

export function ProfilePage({
  user,
  onBack,
  onLogout,
  onUserUpdated,
  onProfile,
  onAdmin,
  showAdmin,
}: ProfilePageProps) {
  const updateProfileMutation = useUpdateProfileMutation(onUserUpdated);

  const handleUpdateProfile = async (payload: { name: string }) => {
    await updateProfileMutation.mutateAsync(payload);
  };

  return (
    <AppLayout onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin}>
      <ProfileScreen
        onBack={onBack}
        onLogout={onLogout}
        onUpdateProfile={handleUpdateProfile}
        user={user}
      />
    </AppLayout>
  );
}
