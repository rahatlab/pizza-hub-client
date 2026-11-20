import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
      </div>
      <h1 className="text-h1 mb-4">Subscription Active!</h1>
      <p className="text-body-lg text-muted-foreground mb-8">
        Your Premium subscription is now active. Enjoy unlimited menu items and featured placement.
      </p>
      <Link href="/dashboard/vendor">
        <button className="flex items-center justify-center gap-2 btn-pill">
          Go to Vendor Dashboard
        </button>
      </Link>
    </section>
  );
}
