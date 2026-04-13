import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

interface LoginScreenProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: () => void;
  onGoogleLogin: (payload: { idToken: string }) => Promise<void>;
  googleEnabled: boolean;
}

export function LoginScreen({
  onLogin,
  onRegister,
  onGoogleLogin,
  googleEnabled,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onLogin({ email, password });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sikertelen bejelentkezés. Próbáld újra.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onGoogleLogin({ idToken });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sikertelen Google bejelentkezés. Próbáld újra.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-white">
        <div>
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="font-semibold">OI</span>
            </div>
            <span className="font-medium">OrderIq Pénztár</span>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl leading-tight">Rendelések gyorsan, egyszerűen.</h1>
          <p className="text-white/80 text-lg">
            Kezeld a kávékat, italokat és ételeket villámgyors fizetéssel.
          </p>
        </div>
        <div className="text-sm text-white/60">Biztonságos hozzáférés • Mindig elérhető</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-2xl">Üdv újra!</h2>
            <p className="text-gray-500 mt-2">Jelentkezz be a folytatáshoz.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm text-gray-600">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@orderiq.com"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">Jelszó</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 text-white transition-all"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              {isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            vagy
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {googleEnabled ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    void handleGoogleSuccess(credentialResponse.credential);
                    return;
                  }
                  setErrorMessage("Sikertelen Google bejelentkezés. Hiányzó ID token.");
                }}
                onError={() => setErrorMessage("Sikertelen Google bejelentkezés. Próbáld újra.")}
                useOneTap={false}
              />
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center">
              Add meg a <code>VITE_GOOGLE_CLIENT_ID</code> változót a Google belépéshez.
            </p>
          )}

          <div className="mt-6 text-sm text-gray-500 text-center">
            Nincs még fiókod?{" "}
            <button
              type="button"
              onClick={onRegister}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Regisztráció
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
