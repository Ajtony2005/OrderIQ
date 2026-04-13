import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { CartPanel, CartItem } from "./CartPanel";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Espresso",
    price: 3.5,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Cappuccino",
    price: 4.5,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Latte",
    price: 4.75,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Americano",
    price: 3.75,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Mocha",
    price: 5.25,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1578374173705-0c52f2b7a4d0?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Cold Brew",
    price: 4.25,
    category: "Kávé",
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop",
  },
  {
    id: "7",
    name: "Narancslé",
    price: 4,
    category: "Italok",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  },
  {
    id: "8",
    name: "Jeges tea",
    price: 3.5,
    category: "Italok",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
  },
  {
    id: "9",
    name: "Limonádé",
    price: 3.75,
    category: "Italok",
    image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0d?w=400&h=400&fit=crop",
  },
  {
    id: "10",
    name: "Turmix",
    price: 6.5,
    category: "Italok",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop",
  },
  {
    id: "11",
    name: "Croissant",
    price: 3.5,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
  },
  {
    id: "12",
    name: "Bagel",
    price: 3,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1586985194017-7b7e3e2c2e58?w=400&h=400&fit=crop",
  },
  {
    id: "13",
    name: "Muffin",
    price: 3.75,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop",
  },
  {
    id: "14",
    name: "Szendvics",
    price: 8.5,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
  },
  {
    id: "15",
    name: "Saláta",
    price: 9,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
  },
  {
    id: "16",
    name: "Avokádós pirítós",
    price: 7.5,
    category: "Étel",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop",
  },
];

const categories = ["Összes", "Kávé", "Italok", "Étel"];

interface OrderingScreenProps {
  onCheckout: (items: CartItem[]) => void;
}

export function OrderingScreen({ onCheckout }: OrderingScreenProps) {
  const [activeCategory, setActiveCategory] = useState("Összes");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const filteredProducts =
    activeCategory === "Összes"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const handleAddToCart = (id: string, name: string, price: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { id, name, price, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      onCheckout(cartItems);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4 max-w-7xl">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-[400px] flex-shrink-0">
        <CartPanel
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
