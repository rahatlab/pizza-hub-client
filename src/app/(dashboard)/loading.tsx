export default function Loading() {
  return (
    <div className="ph-section">
      <div className="ph-container space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-sunken" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ph-card h-28 animate-pulse bg-sunken" />
          ))}
        </div>
      </div>
    </div>
  );
}