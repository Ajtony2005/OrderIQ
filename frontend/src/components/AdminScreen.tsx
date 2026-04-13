import { useEffect, useMemo, useState } from "react";
import { endpoints, Product, AdminProductPayload, AdminUserResponse } from "../lib/endpoints";

interface AdminScreenProps {
  onBack: () => void;
}

type AdminTab = "products" | "users";

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [tab, setTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AdminProductPayload | null>(null);

  const money = useMemo(
    () => new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [productsData, usersData] = await Promise.all([
          endpoints.admin.products.list(),
          endpoints.admin.users.list(),
        ]);
        if (isMounted) {
          setProducts(productsData);
          setUsers(usersData);
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
      const payload: AdminProductPayload = {
        name: "Új termék",
        price: 990,
        category: "Kávé",
        image: "",
      };
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
      const updated = await endpoints.admin.products.update(id, editDraft);
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
                        value={editDraft.price}
                        onChange={(event) => handleEditChange("price", Number(event.target.value))}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                      />
                      <input
                        value={editDraft.category}
                        onChange={(event) => handleEditChange("category", event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                      />
                      <input
                        value={editDraft.image ?? ""}
                        onChange={(event) => handleEditChange("image", event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2"
                        placeholder="Kép URL"
                      />
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
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          )}
        </div>
      </div>
    </div>
  );
}
