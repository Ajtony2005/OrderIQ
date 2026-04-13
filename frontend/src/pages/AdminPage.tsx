import { AdminScreen } from "../components/AdminScreen";
import { AppLayout } from "../components/AppLayout";

interface AdminPageProps {
  onBack: () => void;
  onProfile: () => void;
  onAdmin: () => void;
}

export function AdminPage({ onBack, onProfile, onAdmin }: AdminPageProps) {
  return (
    <AppLayout onProfile={onProfile} onAdmin={onAdmin} showAdmin>
      <AdminScreen onBack={onBack} />
    </AppLayout>
  );
}
