import { useState } from "react";
import { Header } from "./components/Header";
import { OrderingScreen } from "./components/OrderingScreen";
import { CheckoutScreen } from "./components/CheckoutScreen";
import { CartItem } from "./components/CartPanel";

type Screen = "ordering" | "checkout";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("ordering");
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  const handleCheckout = (items: CartItem[]) => {
    setCheckoutItems(items);
    setCurrentScreen("checkout");
  };

  const handleBack = () => {
    setCurrentScreen("ordering");
  };

  const handleComplete = () => {
    setCheckoutItems([]);
    setCurrentScreen("ordering");
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Header />

      {currentScreen === "ordering" ? (
        <OrderingScreen onCheckout={handleCheckout} />
      ) : (
        <CheckoutScreen items={checkoutItems} onBack={handleBack} onComplete={handleComplete} />
      )}
    </div>
  );
}
