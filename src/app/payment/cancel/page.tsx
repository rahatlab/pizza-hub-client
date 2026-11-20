import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mx-auto mb-6">
        <span className="text-amber-600 dark:text-amber-400">⟳</span>
      </div>
      <h1 className="text-h1 mb-4">Payment Cancelled</h1>
      <p className="text-body-lg text-muted-foreground mb-8">
        Your subscription upgrade was cancelled. You can try again anytime.
      </p>
      <Link href="/dashboard/vendor/subscription">
        <button className="flex items-center justify-center gap-2 btn-pill">
          Try Again
        </button>
      </Link>
    </section>
  );
}
