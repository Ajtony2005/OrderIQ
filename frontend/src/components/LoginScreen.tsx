import { useState } from "react";

interface LoginScreenProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: () => void;
  onGoogleLogin: () => void;
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

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={!googleEnabled}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 py-3 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.4H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 5.5 29.2 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.6z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 5.5 29.2 3 24 3c-8.1 0-15.1 4.5-18.7 11.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.1 0 9.8-1.9 13.4-5.1l-6.2-5.2C29.1 36.2 26.7 37 24 37c-5.1 0-9.4-3.4-10.9-8.1l-6.5 5C9.9 40.5 16.5 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.4H42V20H24v8h11.3c-.8 2.1-2.3 3.9-4.1 5.2l.1.1 6.2 5.2C36.9 39.1 45 34 45 24c0-1.4-.1-2.7-.4-3.6z"
              />
            </svg>
            Folytatás Google-lel
          </button>
          {!googleEnabled && (
            <p className="mt-2 text-xs text-gray-400 text-center">
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
