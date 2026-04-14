import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  onProfile: () => void;
  onAdmin?: () => void;
  showAdmin?: boolean;
}

export function AppLayout({ children, onProfile, onAdmin, showAdmin }: AppLayoutProps) {
  return (
    <div className="size-full min-h-0 flex flex-col bg-gray-50">
      <Header onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
