import { useState } from "react";

export type RegistrationPayload = { name: string; email: string; password: string };

interface RegistrationScreenProps {
  onRegister: (payload: RegistrationPayload) => Promise<void>;
  onBackToLogin: () => void;
}

export function RegistrationScreen({ onRegister, onBackToLogin }: RegistrationScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("A két jelszó nem egyezik.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onRegister({ name, email, password });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sikertelen regisztráció. Próbáld újra.";
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
          <h1 className="text-4xl leading-tight">Hozd létre a fiókodat.</h1>
          <p className="text-white/80 text-lg">
            Regisztrálj, és kezdd el a gyors, modern értékesítést.
          </p>
        </div>
        <div className="text-sm text-white/60">Biztonságos beléptetés • Azonnali hozzáférés</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-2xl">Fiók létrehozása</h2>
            <p className="text-gray-500 mt-2">Csatlakozz az OrderIq-hoz.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm text-gray-600">Teljes név</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Johnson"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

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
                placeholder="Hozz létre jelszót"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">Jelszó megerősítése</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ismételd meg a jelszót"
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
              {isSubmitting ? "Fiók létrehozása..." : "Fiók létrehozása"}
            </button>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </form>

          <div className="mt-6 text-sm text-gray-500 text-center">
            Van már fiókod?{" "}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Bejelentkezés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
