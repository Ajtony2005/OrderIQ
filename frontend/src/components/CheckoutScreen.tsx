import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "./CartPanel";
import { ArrowLeftIcon, BanknoteIcon, CheckIcon, CreditCardIcon, SmartphoneIcon } from "./icons";
import { endpoints } from "../lib/endpoints";

interface CheckoutScreenProps {
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
}

type PaymentMethod = "cash" | "card" | "digital" | null;

export function CheckoutScreen({ items, onBack, onComplete }: CheckoutScreenProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.27;
  const tip = subtotal * selectedTip;
  const total = subtotal + tax + tip;
  const money = new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
  });

  const tipOptions = [
    { label: "Nincs borravaló", value: 0 },
    { label: "5%", value: 0.05 },
    { label: "10%", value: 0.1 },
    { label: "15%", value: 0.15 },
  ];

  const handleConfirmPayment = async () => {
    if (!selectedPayment || isSubmittingPayment || items.length === 0) {
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    try {
      const createdOrder = await endpoints.orders.create({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        tipPercent: selectedTip,
        paymentMethod: selectedPayment,
      });

      await Promise.all([endpoints.orders.byId(createdOrder.id), endpoints.orders.list()]);

      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sikertelen rendeles rogzitese.";
      setPaymentError(message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="h-full min-h-0 bg-gray-50 overflow-hidden">
      <AnimatePresence>
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <CheckIcon size={48} className="text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2"
            >
              Sikeres fizetés
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Köszönjük a rendelést!
            </motion.p>
          </motion.div>
        ) : (
          <div className="h-full min-h-0 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-6 flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors touch-none"
              >
                <ArrowLeftIcon size={24} />
              </button>
              <div>
                <h2>Fizetés</h2>
                <p className="text-sm text-gray-500">2/2 - Véglegesítés</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-medium text-blue-900">2/2 - Fizetés és jóváhagyás</p>
                  <div className="mt-2 h-2 rounded-full bg-blue-100">
                    <div className="h-full w-full rounded-full bg-blue-600" />
                  </div>
                  <p className="mt-2 text-xs text-blue-800">
                    Még ellenőrizd a részleteket, utána véglegesítheted a rendelést.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="mb-4">Rendelés összegzése</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-600">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{money.format(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Részösszeg</span>
                      <span>{money.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Áfa (27%)</span>
                      <span>{money.format(tax)}</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Borravaló ({(selectedTip * 100).toFixed(0)}%)</span>
                        <span>{money.format(tip)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span>Végösszeg</span>
                      <span>{money.format(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="mb-4">Borravaló</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {tipOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedTip(option.value)}
                        className="py-4 px-4 rounded-xl border-2 transition-all touch-none min-h-16"
                        style={{
                          borderColor:
                            selectedTip === option.value ? "var(--brand-primary)" : "#e5e7eb",
                          backgroundColor: selectedTip === option.value ? "#eef2ff" : "white",
                          color: selectedTip === option.value ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="mb-4">Fizetési mód</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSelectedPayment("cash")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-30"
                      style={{
                        borderColor:
                          selectedPayment === "cash" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "cash" ? "#eef2ff" : "white",
                      }}
                    >
                      <BanknoteIcon
                        size={32}
                        className={
                          selectedPayment === "cash" ? "text-(--brand-primary)" : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color: selectedPayment === "cash" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Készpénz
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPayment("card")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-30"
                      style={{
                        borderColor:
                          selectedPayment === "card" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "card" ? "#eef2ff" : "white",
                      }}
                    >
                      <CreditCardIcon
                        size={32}
                        className={
                          selectedPayment === "card" ? "text-(--brand-primary)" : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color: selectedPayment === "card" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Kártya
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPayment("digital")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-30"
                      style={{
                        borderColor:
                          selectedPayment === "digital" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "digital" ? "#eef2ff" : "white",
                      }}
                    >
                      <SmartphoneIcon
                        size={32}
                        className={
                          selectedPayment === "digital" ? "text-(--brand-primary)" : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color: selectedPayment === "digital" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Digitális
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-6">
              <div className="max-w-2xl mx-auto">
                {paymentError && <p className="mb-3 text-sm text-red-600">{paymentError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onBack}
                    disabled={isSubmittingPayment}
                    className="w-full py-5 rounded-xl border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 touch-none disabled:opacity-50 disabled:cursor-not-allowed min-h-16"
                  >
                    Vissza módosításhoz
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!selectedPayment || isSubmittingPayment || items.length === 0}
                    className="w-full py-5 rounded-xl transition-all touch-none disabled:opacity-50 disabled:cursor-not-allowed min-h-16"
                    style={{
                      backgroundColor:
                        selectedPayment && !isSubmittingPayment
                          ? "var(--brand-primary)"
                          : "#e5e7eb",
                      color: selectedPayment && !isSubmittingPayment ? "white" : "#9ca3af",
                    }}
                  >
                    {isSubmittingPayment
                      ? "Rendeles rogzitese..."
                      : `Fizetes megerositese - ${money.format(total)}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
