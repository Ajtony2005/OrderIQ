import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { Header } from "./components/Header";
import { OrderingScreen } from "./components/OrderingScreen";
import { CheckoutScreen } from "./components/CheckoutScreen";
import { CartItem } from "./components/CartPanel";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { RegistrationPayload, RegistrationScreen } from "./components/RegistrationScreen";
import { AdminScreen } from "./components/AdminScreen";
import { endpoints } from "./lib/endpoints";

function AppLayout({
  children,
  onProfile,
  onAdmin,
  showAdmin,
}: {
  children: React.ReactNode;
  onProfile: () => void;
  onAdmin?: () => void;
  showAdmin?: boolean;
}) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Header onProfile={onProfile} onAdmin={onAdmin} showAdmin={showAdmin} />
      {children}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string }>({});
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

  const fetchGoogleUser = async (token: TokenResponse) => {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const data: { name?: string; email?: string } = await response.json();
    const role = adminEmail && data.email?.toLowerCase() === adminEmail ? "admin" : "staff";
    setUser({ name: data.name, email: data.email, role });
    localStorage.setItem("auth_token", token.access_token);
  };

  const handleLogin = async (payload: { email: string; password: string }) => {
    const authResult = await endpoints.auth.login(payload);

    localStorage.setItem("auth_token", authResult.accessToken);
    setUser({
      name: authResult.user.name,
      email: authResult.user.email,
      role: authResult.user.role === "ADMIN" ? "admin" : "staff",
    });
    setIsAuthenticated(true);
    navigate("/ordering");
  };

  const handleRegister = async (payload?: RegistrationPayload) => {
    if (payload && "access_token" in payload) {
      await fetchGoogleUser(payload);
    } else if (payload) {
      const authResult = await endpoints.auth.register(payload);
      localStorage.setItem("auth_token", authResult.accessToken);
      setUser({
        name: authResult.user.name,
        email: authResult.user.email,
        role: authResult.user.role === "ADMIN" ? "admin" : "staff",
      });
    }
    setIsAuthenticated(true);
    navigate("/ordering");
  };

  const handleGoToRegister = () => {
    navigate("/register");
  };

  const handleGoToLogin = () => {
    navigate("/login");
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

  const handleLogout = () => {
    setCheckoutItems([]);
    setUser({});
    setIsAuthenticated(false);
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/ordering");
  };

  const handleComplete = () => {
    setCheckoutItems([]);
    navigate("/ordering");
  };

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
          ) : googleEnabled ? (
            <LoginWithGoogle
              onLogin={handleLogin}
              onRegister={handleGoToRegister}
              onGoogleSuccess={handleRegister}
              googleEnabled={googleEnabled}
            />
          ) : (
            <LoginScreen
              onLogin={handleLogin}
              onRegister={handleGoToRegister}
              onGoogleLogin={() => {}}
              googleEnabled={false}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/ordering" replace />
          ) : (
            <RegistrationScreen
              onRegister={handleRegister}
              onBackToLogin={handleGoToLogin}
              googleEnabled={googleEnabled}
            />
          )
        }
      />
      <Route
        path="/ordering"
        element={
          isAuthenticated ? (
            <AppLayout
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user.role === "admin"}
            >
              <OrderingScreen onCheckout={handleCheckout} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/checkout"
        element={
          isAuthenticated ? (
            <AppLayout
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user.role === "admin"}
            >
              <CheckoutScreen
                items={checkoutItems}
                onBack={handleBack}
                onComplete={handleComplete}
              />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <AppLayout
              onProfile={handleProfile}
              onAdmin={handleAdmin}
              showAdmin={user.role === "admin"}
            >
              <ProfileScreen onBack={handleBack} onLogout={handleLogout} user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAuthenticated && user.role === "admin" ? (
            <AppLayout onProfile={handleProfile} onAdmin={handleAdmin} showAdmin>
              <AdminScreen onBack={handleBack} />
            </AppLayout>
          ) : (
            <Navigate to="/ordering" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LoginWithGoogle({
  onLogin,
  onRegister,
  onGoogleSuccess,
  googleEnabled,
}: {
  onLogin: (payload: { email: string }) => void;
  onRegister: () => void;
  onGoogleSuccess: (token: TokenResponse) => void;
  googleEnabled: boolean;
}) {
  const redirectUri = window.location.origin;
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => onGoogleSuccess(tokenResponse),
    redirect_uri: redirectUri,
    ux_mode: "popup",
  });

  return (
    <LoginScreen
      onLogin={onLogin}
      onRegister={onRegister}
      onGoogleLogin={() => googleLogin()}
      googleEnabled={googleEnabled}
    />
  );
}
