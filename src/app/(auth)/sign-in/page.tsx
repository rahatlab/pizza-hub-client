import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

/** `useSearchParams` needs a Suspense boundary when the page is prerendered. */
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}