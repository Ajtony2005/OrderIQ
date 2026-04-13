import { motion, AnimatePresence } from "framer-motion";
import { MinusIcon, PlusIcon, TrashIcon } from "./icons";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartPanel({ items, onUpdateQuantity, onRemove, onCheckout }: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.27;
  const total = subtotal + tax;
  const money = new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
  });

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2>Aktuális rendelés</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full text-gray-400"
            >
              <p>Nincs tétel</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate">{item.name}</h4>
                    <p className="text-gray-600">{money.format(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? onRemove(item.id)
                          : onUpdateQuantity(item.id, -1)
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-none"
                    >
                      {item.quantity === 1 ? (
                        <TrashIcon size={18} className="text-red-500" />
                      ) : (
                        <MinusIcon size={18} />
                      )}
                    </button>

                    <span className="w-8 text-center">{item.quantity}</span>

                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-none"
                    >
                      <PlusIcon size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-gray-200 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Részösszeg</span>
            <span>{money.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Áfa (27%)</span>
            <span>{money.format(tax)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span>Végösszeg</span>
            <span>{money.format(total)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-4 rounded-xl transition-all touch-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          style={{
            backgroundColor: items.length > 0 ? "var(--brand-primary)" : "#e5e7eb",
            color: items.length > 0 ? "white" : "#9ca3af",
          }}
        >
          Fizetés
        </button>
      </div>
    </div>
  );
}
