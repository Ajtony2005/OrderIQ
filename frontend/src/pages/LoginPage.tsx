import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LoginScreen } from "../components/LoginScreen";
import { loginWithGoogle, loginWithPassword, type AuthSession } from "../services/authService";

interface LoginPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const navigate = useNavigate();
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
  const passwordLoginMutation = useMutation({
    mutationFn: loginWithPassword,
    onSuccess: onAuthenticated,
  });
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: onAuthenticated,
  });

  const handleLogin = async (payload: { email: string; password: string }) => {
    await passwordLoginMutation.mutateAsync(payload);
  };

  const handleGoogleLogin = async (payload: { idToken: string }) => {
    await googleLoginMutation.mutateAsync(payload);
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onRegister={() => navigate("/register")}
      googleEnabled={googleEnabled}
    />
  );
}
