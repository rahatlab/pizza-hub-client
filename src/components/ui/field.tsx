"use client";

import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  error?: string;
}

/** Label + input pair used by every auth form. */
export function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  icon,
  error,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-neutral">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 w-full rounded-xl border bg-raised text-sm text-neutral outline-none transition-colors",
            "placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15",
            icon ? "pl-9 pr-3.5" : "px-3.5",
            error ? "border-primary" : "border-line",
          )}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
