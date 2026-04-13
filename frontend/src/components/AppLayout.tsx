import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  onProfile: () => void;
  onAdmin?: () => void;
  showAdmin?: boolean;
}

export function AppLayout({ children, onProfile, onAdmin, showAdmin }: AppLayoutProps) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Header onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin} />
      {children}
    </div>
  );
}
