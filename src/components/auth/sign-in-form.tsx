"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";
import { homeFor, useAuth } from "@/components/auth/auth-provider";
import { Field } from "@/components/ui/field";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // `next` carries the private page the user originally asked for.
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const signedInHandled = useRef(false);

  useEffect(() => {
    if (loading || !user || signedInHandled.current) return;
    signedInHandled.current = true;
    toast.info(`You're already signed in as ${user.email}`);
    router.replace(safeNext ?? homeFor(user.role));
  }, [loading, user, safeNext, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (password.length === 0) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const signedIn = await signIn(email.trim(), password);
      toast.success(`Welcome back, ${signedIn.name.split(" ")[0]}!`);
      router.replace(safeNext ?? homeFor(signedIn.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign you in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ph-card p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-neutral">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to order, manage your menu, or run the platform.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          id="email"
          label="Email"
          type="email"
          icon={<Mail className="h-4 w-4" aria-hidden />}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />

        <div>
          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="h-4 w-4" aria-hidden />}
            value={password}
            onChange={setPassword}
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-neutral"
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden />
            )}
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or continue with
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Sign in with Google" />

      <p className="mt-6 text-center text-sm text-muted">
        New to PizzaHub?{" "}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

