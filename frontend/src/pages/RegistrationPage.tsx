import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { RegistrationScreen, type RegistrationPayload } from "../components/RegistrationScreen";
import { registerWithPassword, type AuthSession } from "../services/authService";

interface RegistrationPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

export function RegistrationPage({ onAuthenticated }: RegistrationPageProps) {
  const navigate = useNavigate();
  const registerMutation = useMutation({
    mutationFn: registerWithPassword,
    onSuccess: onAuthenticated,
  });

  const handleRegister = async (payload: RegistrationPayload) => {
    await registerMutation.mutateAsync(payload);
  };

  return (
    <RegistrationScreen onRegister={handleRegister} onBackToLogin={() => navigate("/login")} />
  );
}
