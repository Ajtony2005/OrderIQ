import { CartItem } from "../components/CartPanel";
import { OrderingScreen } from "../components/OrderingScreen";
import { AppLayout } from "../components/AppLayout";

interface OrderingPageProps {
  onCheckout: (items: CartItem[]) => void;
  onProfile: () => void;
  onAdmin: () => void;
  showAdmin: boolean;
}

export function OrderingPage({ onCheckout, onProfile, onAdmin, showAdmin }: OrderingPageProps) {
  return (
    <AppLayout onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin}>
      <OrderingScreen onCheckout={onCheckout} />
    </AppLayout>
  );
}
