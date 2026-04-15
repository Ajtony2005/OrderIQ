import { useEffect, useMemo, useState } from "react";
import {
  endpoints,
  Product,
  AdminProductPayload,
  AdminUserResponse,
  OrderResponse,
} from "../lib/endpoints";
import { fetchUnsplashImageUrl } from "../lib/unsplash";
import { adminProductPayloadSchema } from "@orderiq/types";

interface AdminScreenProps {
  onBack: () => void;
}

type AdminTab = "products" | "users" | "orders";

function normalizeProductPayload(payload: AdminProductPayload): AdminProductPayload {
  const parsed = adminProductPayloadSchema.parse(payload);

  return {
    ...parsed,
    image: parsed.image?.trim() || undefined,
  };
}

export function AdminScreen({ onBack }: AdminScreenProps) {
  const unsplashAccessKey = (
    import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
  )?.trim();
  const [tab, setTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AdminProductPayload | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isOrderDetailLoading, setIsOrderDetailLoading] = useState(false);
  const [isUnsplashLoading, setIsUnsplashLoading] = useState(false);

  const money = useMemo(
    () => new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }),
    [],
  );
  const dateTime = useMemo(
    () =>
      new Intl.DateTimeFormat("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [productsData, usersData, ordersData] = await Promise.all([
          endpoints.admin.products.list(),
          endpoints.admin.users.list(),
          endpoints.admin.orders.list(),
        ]);
        if (isMounted) {
          setProducts(productsData);
          setUsers(usersData);
          setOrders(ordersData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Ismeretlen hiba");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async () => {
    try {
      const draftPayload: AdminProductPayload = {
        name: "Új termék",
        price: 990,
        category: "Kávé",
        image: "",
      };

      const payload = normalizeProductPayload(draftPayload);

      if (unsplashAccessKey) {
        const imageFromUnsplash = await fetchUnsplashImageUrl(
          `${payload.name} ${payload.category}`,
          unsplashAccessKey,
        );

        if (imageFromUnsplash) {
          payload.image = imageFromUnsplash;
        }
      }

      const created = await endpoints.admin.products.create(payload);
      setProducts((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditDraft({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  };

  const handleEditChange = (key: keyof AdminProductPayload, value: string | number) => {
    setEditDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editDraft) {
      return;
    }

    try {
      const payload = normalizeProductPayload(editDraft);
      const updated = await endpoints.admin.products.update(id, payload);
      setProducts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      handleCancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await endpoints.admin.products.remove(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      const updated = await endpoints.admin.users.updateRole(id, role);
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    }
  };

  const handleOrderDetail = async (id: string) => {
    try {
      setIsOrderDetailLoading(true);
      const order = await endpoints.admin.orders.byId(id);
      setSelectedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    } finally {
      setIsOrderDetailLoading(false);
    }
  };

  const handleUnsplashImage = async () => {
    if (!editDraft) {
      return;
    }

    if (!unsplashAccessKey) {
      setError("A VITE_UNSPLASH_ACCESS_KEY nincs beallitva.");
      return;
    }

    try {
      setIsUnsplashLoading(true);
      setError(null);
      const query = `${editDraft.name} ${editDraft.category}`.trim();

      if (!query) {
        setError("Adj meg termeknevet vagy kategoriat a kepkereseshez.");
        return;
      }

      const imageUrl = await fetchUnsplashImageUrl(query, unsplashAccessKey);

      if (!imageUrl) {
        setError("Nem talalhato megfelelo kep az Unsplash-en.");
        return;
      }

      setEditDraft((prev) => (prev ? { ...prev, image: imageUrl } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    } finally {
      setIsUnsplashLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl">Admin</h2>
              <p className="text-gray-500 mt-1">Termékek és felhasználók kezelése.</p>
            </div>
            <div className="flex gap-3">
              {tab === "products" && (
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  Új termék
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Vissza
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("products")}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                tab === "products"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Termékek
            </button>
            <button
              onClick={() => setTab("users")}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                tab === "users"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Felhasználók
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                tab === "orders"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Rendelések
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Betöltés...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : tab === "products" ? (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.id} className="py-4 flex flex-col gap-3">
                  {editingId === product.id && editDraft ? (
                    <div className="grid gap-3 sm:grid-cols-4">
                      <input
                        value={editDraft.name}
                        onChange={(event) => handleEditChange("name", event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                      />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={editDraft.price}
                        onChange={(event) => {
                          const value = event.target.value.replace(",", ".");
                          handleEditChange("price", value === "" ? Number.NaN : Number(value));
                        }}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                      />
                      <input
                        value={editDraft.category}
                        onChange={(event) => handleEditChange("category", event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                      />

                      <div className="sm:col-span-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                          value={editDraft.image ?? ""}
                          readOnly
                          className="rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 text-gray-600"
                          placeholder="Unsplash kep URL automatikusan"
                        />
                        <button
                          onClick={handleUnsplashImage}
                          disabled={isUnsplashLoading}
                          className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-sm disabled:opacity-60"
                        >
                          {isUnsplashLoading ? "Kereses..." : "Unsplash kep"}
                        </button>
                      </div>

                      {editDraft.image && (
                        <div className="sm:col-span-4">
                          <img
                            src={editDraft.image}
                            alt={editDraft.name}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.category} • {money.format(product.price)}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {editingId === product.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(product.id)}
                          className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-sm"
                        >
                          Mentés
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        >
                          Mégse
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        >
                          Szerkesztés
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600"
                        >
                          Törlés
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "users" ? (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Szerepkör</span>
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="staff">Dolgozó</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-gray-500">Nincs megjelenitheto rendeles.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">Rendelés #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {dateTime.format(new Date(order.createdAt))}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{money.format(order.total)}</p>
                        <button
                          onClick={() => handleOrderDetail(order.id)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        >
                          Részletek
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isOrderDetailLoading && (
                <p className="text-gray-500">Rendeles reszletek betoltese...</p>
              )}

              {selectedOrder && !isOrderDetailLoading && (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Kiválasztott rendelés</p>
                  <p className="mt-2 font-medium break-all">{selectedOrder.id}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {dateTime.format(new Date(selectedOrder.createdAt))}
                  </p>
                  <p className="mt-3">Végösszeg: {money.format(selectedOrder.total)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
