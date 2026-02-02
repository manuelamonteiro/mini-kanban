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
import { register as apiRegister } from "@/lib/service/auth";
import { parseErrorMessage } from "@/lib/utils";
import { registerSchema } from "@/lib/validation/auth";

type FormFields = "name" | "email" | "password";
type FormErrors = Partial<Record<FormFields, string>>;

function getFieldErrors(details: Array<{ path: Array<string | number>; message: string }>): FormErrors {
  const errors: FormErrors = {};

  for (const detail of details) {
    const field = detail.path?.[0];
    if (field === "name" || field === "email" || field === "password") {
      errors[field] = detail.message;
    }
  }

  return errors;
}

function passwordHasSpaces(value: string): boolean {
  return /\s/.test(value);
}

export default function RegisterPage() {
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
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? "").trim(),
    };

    if (passwordHasSpaces(payload.password)) {
      setFormErrors({ password: "Password cannot contain spaces." });
      toast.error("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    const validation = registerSchema.validate(payload, { abortEarly: false });

    if (validation.error) {
      setFormErrors(getFieldErrors(validation.error.details));
      toast.error("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiRegister(payload.name, payload.email, payload.password);
      setAccessToken(data.accessToken);
      toast.success("Account created successfully.");
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
        data-testid="register-page-loading"
        id="register-page-loading"
      >
        <div className="flex items-center gap-2 text-slate-700" data-testid="register-loading" id="register-loading">
          <Spinner />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4" data-testid="register-page" id="register-page">
      <Card className="w-full max-w-md shadow-lg" data-testid="register-card" id="register-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Mini Kanban</span>
          </CardTitle>

          <CardDescription className="text-sm text-slate-600">
            Create your account to start organizing your boards in minutes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate data-testid="register-form" id="register-form">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                autoComplete="name"
                aria-invalid={Boolean(formErrors.name)}
                aria-describedby={formErrors.name ? "name-error" : undefined}
                disabled={loading}
                required
                data-testid="register-name"
              />
              {formErrors.name ? (
                <p id="name-error" className="text-xs text-red-600" data-testid="register-name-error">
                  {formErrors.name}
                </p>
              ) : null}
            </div>

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
                data-testid="register-email"
              />
              {formErrors.email ? (
                <p id="email-error" className="text-xs text-red-600" data-testid="register-email-error">
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
                autoComplete="new-password"
                aria-invalid={Boolean(formErrors.password)}
                aria-describedby={formErrors.password ? "password-error" : undefined}
                disabled={loading}
                required
                data-testid="register-password"
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
                <p id="password-error" className="text-xs text-red-600" data-testid="register-password-error">
                  {formErrors.password}
                </p>
              ) : null}
            </div>

            {globalError ? (
              <p className="text-sm text-red-600" data-testid="register-global-error" id="register-global-error">
                {globalError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              data-testid="register-submit"
              id="register-submit"
            >
              {loading ? (
                <>
                  <Spinner className="text-white" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-600" data-testid="register-footer">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline"
              data-testid="register-signin-link"
              id="register-signin-link"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
