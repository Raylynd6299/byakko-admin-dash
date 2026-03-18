import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/router/routes";
import { useAuthStore } from "@/stores/auth.store";
import { httpClient } from "@/services/http-client";
import { ThemeToggle } from "@/components/layout/app-shell/components/top-bar/components/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import type { AdminTokens, AdminProfile } from "@/types/auth.types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.email({ error: "login.emailError" }),
  password: z.string().min(1, { error: "login.passwordError" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Login service (inline — no TanStack Query needed for auth) ───────────────

interface LoginResponse {
  access_token:  string;
  refresh_token: string;
}

interface ProfileResponse {
  email: string;
}

async function loginRequest(
  data: LoginFormData
): Promise<{ tokens: AdminTokens; profile: AdminProfile }> {
  const { data: tokens } = await httpClient.post<LoginResponse>("/login", {
    email:    data.email,
    password: data.password,
  });

  const { data: profile } = await httpClient.get<ProfileResponse>("/profile", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  return {
    tokens:  { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    profile: { email: profile.email },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login    = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setServerError(null);
    try {
      const { tokens, profile } = await loginRequest(data);
      login(tokens, profile);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch {
      setServerError(t("login.error"));
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      {/* Background grid — subtle texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--border-strong) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Language selector — top right */}
      <div className="fixed top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in">
        {/* Glow — top edge */}
        <div
          className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2"
          style={{
            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
          }}
        />

        <div
          className="rounded-xl border p-8"
          style={{
            backgroundColor: "var(--surface-2)",
            borderColor:     "var(--border-default)",
          }}
        >
          {/* Brand mark */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--accent-muted)",
                border:          "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <ShieldCheck size={22} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div className="text-center">
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {t("login.title")}
              </h1>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                {t("login.subtitle")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("login.email")}
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className={cn(
                    "w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none transition-colors duration-150",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--border-focus)]",
                    errors.email
                      ? "border-[var(--danger)] bg-[var(--danger-bg)]"
                      : "border-[var(--input-border)] bg-[var(--input-bg)] focus:bg-[var(--input-focus-bg)]"
                  )}
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              {errors.email && (
                <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
                  {t(errors.email.message || "login.emailError")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("login.password")}
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full rounded-md border py-2 pl-9 pr-9 text-sm outline-none transition-colors duration-150",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--border-focus)]",
                    errors.password
                      ? "border-[var(--danger)] bg-[var(--danger-bg)]"
                      : "border-[var(--input-border)] bg-[var(--input-bg)] focus:bg-[var(--input-focus-bg)]"
                  )}
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  type="button"
                  onClick={(): void => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff size={14} strokeWidth={1.5} />
                    : <Eye    size={14} strokeWidth={1.5} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
                  {t(errors.password.message || "login.passwordError")}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError !== null && (
              <div
                className="rounded-md border px-3 py-2 text-xs"
                style={{
                  backgroundColor: "var(--danger-bg)",
                  borderColor:     "var(--danger)",
                  color:           "var(--danger-fg)",
                }}
              >
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1 flex w-full items-center justify-center rounded-md py-2 text-sm font-medium transition-colors duration-150",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
              onMouseEnter={(e): void => {
                e.currentTarget.style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e): void => {
                e.currentTarget.style.backgroundColor = "var(--accent)";
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  {t("login.submitting")}
                </span>
              ) : (
                t("login.submit")
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          {t("login.footer")}
        </p>
      </div>

      {/* Theme toggle — bottom right */}
      <div className="fixed bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
