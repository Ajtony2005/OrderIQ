import { CartItem } from "../components/CartPanel";
import { CheckoutScreen } from "../components/CheckoutScreen";
import { AppLayout } from "../components/AppLayout";

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
  onProfile: () => void;
  onAdmin: () => void;
  showAdmin: boolean;
}

export function CheckoutPage({
  items,
  onBack,
  onComplete,
  onProfile,
  onAdmin,
  showAdmin,
}: CheckoutPageProps) {
  return (
    <AppLayout onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin}>
      <CheckoutScreen items={items} onBack={onBack} onComplete={onComplete} />
    </AppLayout>
  );
}
