"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { useAuth } from "@/lib/providers/auth-provider";
import { login as apiLogin } from "@/lib/service/auth";
import { parseErrorMessage } from "@/lib/utils";
import { loginSchema } from "@/lib/validation/auth";

type FormFields = "email" | "password";
type FormErrors = Partial<Record<FormFields, string>>;

function getFieldErrors(details: Array<{ path: Array<string | number>; message: string }>): FormErrors {
  const errors: FormErrors = {};

  for (const detail of details) {
    const field = detail.path?.[0];
    if (field === "email" || field === "password") {
      errors[field] = detail.message;
    }
  }

  return errors;
}

function passwordHasSpaces(value: string): boolean {
  return /\s/.test(value);
}

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, isAuthenticated } = useAuth();

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthChecking(false);
  }, []);

  useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthChecking, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setFormErrors({});
    setGlobalError(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? "").trim(),
    };

    if (passwordHasSpaces(payload.password)) {
      setFormErrors({ password: "Password cannot contain spaces." });
      toast.error("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    const validation = loginSchema.validate(payload, { abortEarly: false });

    if (validation.error) {
      setFormErrors(getFieldErrors(validation.error.details));
      toast.error("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiLogin(payload.email, payload.password);

      setAccessToken(data.accessToken);

      toast.success("Logged in successfully.");
      router.replace("/home");
    } catch (err) {
      const message = parseErrorMessage(err);
      setGlobalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthChecking || isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
        data-testid="login-page-loading"
        id="login-page-loading"
      >
        <div className="flex items-center gap-2 text-slate-700" data-testid="login-loading" id="login-loading">
          <Spinner />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4" data-testid="login-page" id="login-page">
      <Card className="w-full max-w-md shadow-lg" data-testid="login-card" id="login-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Mini Kanban</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Sign in to keep your Mini Kanban boards moving.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate data-testid="login-form" id="login-form">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(formErrors.email)}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                disabled={loading}
                required
                data-testid="login-email"
              />
              {formErrors.email ? (
                <p id="email-error" className="text-xs text-red-600" data-testid="login-email-error">
                  {formErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(formErrors.password)}
                aria-describedby={formErrors.password ? "password-error" : undefined}
                disabled={loading}
                required
                data-testid="login-password"
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  if (passwordHasSpaces(next)) {
                    e.currentTarget.value = next.replace(/\s+/g, "");
                  }
                }}
              />
              {formErrors.password ? (
                <p id="password-error" className="text-xs text-red-600" data-testid="login-password-error">
                  {formErrors.password}
                </p>
              ) : null}
            </div>

            {globalError ? (
              <p className="text-sm text-red-600" data-testid="login-global-error" id="login-global-error">
                {globalError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              data-testid="login-submit"
              id="login-submit"
            >
              {loading ? (
                <>
                  <Spinner className="text-white" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-600" data-testid="login-footer" id="login-footer">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:underline"
              data-testid="login-register-link"
              id="login-register-link"
            >
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
