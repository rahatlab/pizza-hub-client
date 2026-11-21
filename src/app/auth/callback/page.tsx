"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { homeFor, useAuth } from "@/components/auth/auth-provider";

/**
 * Landing page after the Google consent screen. Better Auth has already
 * created the session cookie, so all that is left is swapping it for the
 * PizzaHub JWT and sending the user to their dashboard.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const { completeGoogle } = useAuth();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // React 19 StrictMode mounts twice in dev — the exchange must run once.
    if (started.current) return;
    started.current = true;

    completeGoogle()
      .then((user) => {
        toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
        router.replace(homeFor(user.role));
      })
      .catch((error: unknown) => {
        setFailed(true);
        toast.error(error instanceof Error ? error.message : "Google sign-in failed");
      });
  }, [completeGoogle, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-6">
      <div className="text-center">
        {failed ? (
          <>
            <span aria-hidden className="text-4xl">
              🍕
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-neutral">
              That didn&apos;t work
            </h1>
            <p className="mt-2 text-sm text-muted">
              We could not finish signing you in with Google.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
            <h1 className="mt-4 font-display text-2xl font-semibold text-neutral">
              Finishing sign-in…
            </h1>
            <p className="mt-2 text-sm text-muted">Hang tight, your oven is preheating.</p>
          </>
        )}
      </div>
    </div>
  );
}
