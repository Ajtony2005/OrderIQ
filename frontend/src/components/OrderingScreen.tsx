import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { CartPanel, CartItem } from "./CartPanel";
import { endpoints, type Category, type Product } from "../lib/endpoints";

const allCategoryLabel = "Összes";
const fallbackProductImage =
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop";

interface OrderingScreenProps {
  onCheckout: (items: CartItem[]) => void;
}

export function OrderingScreen({ onCheckout }: OrderingScreenProps) {
  const [activeCategory, setActiveCategory] = useState(allCategoryLabel);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        setIsCatalogLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          endpoints.catalog.products(),
          endpoints.catalog.categories(),
        ]);

        if (!active) {
          return;
        }

        setProducts(productsData);
        setCategories(categoriesData);
        setCatalogError(null);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Nem sikerult a termekeket betolteni.";
        setCatalogError(message);
      } finally {
        if (active) {
          setIsCatalogLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const categoryNames = useMemo(() => {
    const names = new Set(categories.map((category) => category.name));

    for (const product of products) {
      names.add(product.category);
    }

    return [allCategoryLabel, ...Array.from(names)];
  }, [categories, products]);

  useEffect(() => {
    if (!categoryNames.includes(activeCategory)) {
      setActiveCategory(allCategoryLabel);
    }
  }, [activeCategory, categoryNames]);

  const filteredProducts =
    activeCategory === allCategoryLabel
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

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-900">1/2 - Rendelés összeállítása</p>
            <div className="mt-2 h-2 rounded-full bg-blue-100">
              <div className="h-full w-1/2 rounded-full bg-blue-600" />
            </div>
            <p className="mt-2 text-xs text-blue-800">A következő lépésben fizetési módot választasz és jóváhagyod a rendelést.</p>
          </div>
          <CategoryTabs
            categories={categoryNames}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isCatalogLoading ? (
            <p className="text-gray-500">Termekek betoltese...</p>
          ) : catalogError ? (
            <p className="text-red-500">{catalogError}</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">Nincs megjelenitheto termek ebben a kategoriaban.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image || fallbackProductImage}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-100 shrink-0">
        <CartPanel
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          onClear={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
