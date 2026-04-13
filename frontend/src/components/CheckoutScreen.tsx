import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "./CartPanel";
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CheckIcon,
  CreditCardIcon,
  SmartphoneIcon,
} from "./icons";

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

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const tip = subtotal * selectedTip;
  const total = subtotal + tax + tip;

  const tipOptions = [
    { label: "No Tip", value: 0 },
    { label: "5%", value: 0.05 },
    { label: "10%", value: 0.1 },
    { label: "15%", value: 0.15 },
  ];

  const handleConfirmPayment = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
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
              Payment Successful
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Thank you for your order!
            </motion.p>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 p-6 flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors touch-none"
              >
                <ArrowLeftIcon size={24} />
              </button>
              <h2>Checkout</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-600">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Tip ({(selectedTip * 100).toFixed(0)}%)</span>
                        <span>${tip.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="mb-4">Add Tip</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {tipOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedTip(option.value)}
                        className="py-4 px-4 rounded-xl border-2 transition-all touch-none min-h-[64px]"
                        style={{
                          borderColor:
                            selectedTip === option.value
                              ? "var(--brand-primary)"
                              : "#e5e7eb",
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
                  <h3 className="mb-4">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSelectedPayment("cash")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-[120px]"
                      style={{
                        borderColor:
                          selectedPayment === "cash" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "cash" ? "#eef2ff" : "white",
                      }}
                    >
                      <BanknoteIcon
                        size={32}
                        className={
                          selectedPayment === "cash" ? "text-[var(--brand-primary)]" : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color:
                            selectedPayment === "cash" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Cash
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPayment("card")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-[120px]"
                      style={{
                        borderColor:
                          selectedPayment === "card" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "card" ? "#eef2ff" : "white",
                      }}
                    >
                      <CreditCardIcon
                        size={32}
                        className={
                          selectedPayment === "card" ? "text-[var(--brand-primary)]" : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color:
                            selectedPayment === "card" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Card
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPayment("digital")}
                      className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all touch-none min-h-[120px]"
                      style={{
                        borderColor:
                          selectedPayment === "digital" ? "var(--brand-primary)" : "#e5e7eb",
                        backgroundColor: selectedPayment === "digital" ? "#eef2ff" : "white",
                      }}
                    >
                      <SmartphoneIcon
                        size={32}
                        className={
                          selectedPayment === "digital"
                            ? "text-[var(--brand-primary)]"
                            : "text-gray-500"
                        }
                      />
                      <span
                        style={{
                          color:
                            selectedPayment === "digital" ? "var(--brand-primary)" : "#6b7280",
                        }}
                      >
                        Digital
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-6">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleConfirmPayment}
                  disabled={!selectedPayment}
                  className="w-full py-5 rounded-xl transition-all touch-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[64px]"
                  style={{
                    backgroundColor: selectedPayment ? "var(--brand-primary)" : "#e5e7eb",
                    color: selectedPayment ? "white" : "#9ca3af",
                  }}
                >
                  Confirm Payment - ${total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
