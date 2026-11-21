"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Check, Loader2, Lock, Mail, Store, UserRound } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";
import { homeFor, useAuth, type SignUpRole } from "@/components/auth/auth-provider";
import { Field } from "@/components/ui/field";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: {
  value: SignUpRole;
  title: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    value: "customer",
    title: "Customer",
    description: "Order pizza from local shops",
    icon: UserRound,
  },
  {
    value: "vendor",
    title: "Vendor",
    description: "Sell your own menu on PizzaHub",
    icon: Store,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, user, loading } = useAuth();

  const [role, setRole] = useState<SignUpRole>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace(homeFor(user.role));
  }, [loading, user, router]);

  const checks = [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
  ];

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImage(url);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Tell us your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!checks.every((check) => check.ok)) next.password = "Password does not meet the rules yet";
    if (role === "vendor" && businessName.trim().length < 2) {
      next.businessName = "Your shop needs a name";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        image: image || undefined,
        businessName: role === "vendor" ? businessName.trim() : undefined,
        businessLocation: role === "vendor" ? businessLocation.trim() : undefined,
      });
      toast.success(`Welcome to PizzaHub, ${created.name.split(" ")[0]}!`);
      router.replace(homeFor(created.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ph-card p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-neutral">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          Pick how you want to use PizzaHub — you can order, or run your own kitchen.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-neutral">I&apos;m joining as</legend>
          <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Account type">
            {ROLE_OPTIONS.map((option) => {
              const active = role === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "relative rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary-soft shadow-[inset_0_0_0_1px_var(--ph-primary)]"
                      : "border-line bg-raised hover:border-line-strong",
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active ? "text-primary" : "text-muted")}
                    aria-hidden
                  />
                  <span className="mt-2 block text-sm font-semibold text-neutral">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {option.description}
                  </span>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-line bg-sunken">
              {image ? (
                <Image
                  src={image}
                  alt="Your profile photo"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-5 w-5 text-faint" aria-hidden />
              )}
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-line bg-raised text-xs text-muted hover:text-primary"
                aria-label="Remove photo"
              >
                ×
              </button>
            )}
          </div>
          <div className="text-sm">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {image ? "Change photo" : "Add a profile photo"}
            </button>
            <p className="mt-0.5 text-xs text-faint">Optional · JPG or PNG, hosted on ImgBB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void handlePhoto(event.target.files?.[0])}
          />
        </div>

        <Field
          id="name"
          label="Full name"
          icon={<UserRound className="h-4 w-4" aria-hidden />}
          value={name}
          onChange={setName}
          placeholder="Rahat Chowdhury"
          autoComplete="name"
          error={errors.name}
        />

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
            type="password"
            icon={<Lock className="h-4 w-4" aria-hidden />}
            value={password}
            onChange={setPassword}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
          />
          <ul className="mt-2 grid gap-1">
            {checks.map((check) => (
              <li
                key={check.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  check.ok ? "text-tertiary" : "text-faint",
                )}
              >
                <span
                  className={cn(
                    "grid h-3.5 w-3.5 place-items-center rounded-full border",
                    check.ok ? "border-tertiary bg-tertiary text-white" : "border-line",
                  )}
                  aria-hidden
                >
                  {check.ok && <Check className="h-2.5 w-2.5" />}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
        </div>

        {role === "vendor" && (
          <div className="grid gap-4 rounded-xl border border-line bg-sunken/60 p-4">
            <Field
              id="businessName"
              label="Restaurant name"
              icon={<Store className="h-4 w-4" aria-hidden />}
              value={businessName}
              onChange={setBusinessName}
              placeholder="Rahat Pizza House"
              error={errors.businessName}
            />
            <Field
              id="businessLocation"
              label="Location"
              value={businessLocation}
              onChange={setBusinessLocation}
              placeholder="Dhanmondi, Dhaka"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or continue with
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

