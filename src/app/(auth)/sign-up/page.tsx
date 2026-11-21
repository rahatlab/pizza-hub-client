import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";

/** `useSearchParams` needs a Suspense boundary when the page is prerendered. */
export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}