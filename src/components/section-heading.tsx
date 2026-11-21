import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * One heading pattern for every section — same size, weight and spacing
 * site-wide, which is what the assignment means by a consistent heading style.
 */
export function SectionHeading({
  title,
  description,
  action,
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <h2>{title}</h2>
        {description && <p className="mt-3">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
