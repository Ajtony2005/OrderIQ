import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { CartItem } from "./components/CartPanel";
import { OrderingPage } from "./pages/OrderingPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import {
  clearAccessToken,
  fetchCurrentUser,
  getAccessToken,
  logoutCurrentUser,
  saveAccessToken,
  type AuthSession,
} from "./services/authService";
import { useAuthStore } from "./stores/authStore";

export default function App() {
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const accessToken = getAccessToken();
  const meQuery = useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: fetchCurrentUser,
    enabled: hasHydrated && Boolean(accessToken),
    retry: false,
  });

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      clearAuth();
    }
  }, [hasHydrated, accessToken, clearAuth]);

  useEffect(() => {
    if (!hasHydrated || !accessToken) {
      return;
    }

    if (meQuery.isSuccess) {
      setAuthenticated(meQuery.data);
    }

    if (meQuery.isError) {
      clearAccessToken();
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [
    hasHydrated,
    accessToken,
    meQuery.isSuccess,
    meQuery.isError,
    meQuery.data,
    setAuthenticated,
    clearAuth,
    navigate,
  ]);

  const isAuthLoading = !hasHydrated || (Boolean(accessToken) && meQuery.isPending);

  const handleAuthenticated = ({ accessToken, user: authenticatedUser }: AuthSession) => {
    saveAccessToken(accessToken);
    setAuthenticated(authenticatedUser);
    navigate("/ordering");
  };

  const handleCheckout = (items: CartItem[]) => {
    setCheckoutItems(items);
    navigate("/checkout");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = async () => {
    try {
      if (getAccessToken()) {
        await logoutCurrentUser();
      }
    } catch {
      // Local cleanup should proceed even when logout endpoint fails.
    } finally {
      setCheckoutItems([]);
      clearAuth();
      clearAccessToken();
      navigate("/login");
    }
  };

  const handleBack = () => {
    navigate("/ordering");
  };

  const handleComplete = () => {
    setCheckoutItems([]);
    navigate("/ordering");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Betoltes...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/ordering" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/ordering" replace />
          ) : (
            <LoginPage onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/ordering" replace />
          ) : (
            <RegistrationPage onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/ordering"
        element={
          isAuthenticated ? (
            <OrderingPage
              onCheckout={handleCheckout}
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user?.role === "admin"}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/checkout"
        element={
          isAuthenticated ? (
            <CheckoutPage
              items={checkoutItems}
              onBack={handleBack}
              onComplete={handleComplete}
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user?.role === "admin"}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated && user ? (
            <ProfilePage
              user={user}
              onBack={handleBack}
              onLogout={handleLogout}
              onUserUpdated={updateUser}
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user?.role === "admin"}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminPage onBack={handleBack} onProfile={handleProfile} onAdmin={handleAdmin} />
          ) : (
            <Navigate to="/ordering" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
