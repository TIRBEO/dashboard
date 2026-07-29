import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border bg-white px-4 py-2 text-base text-tirbeo-neutral-900 transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-tirbeo-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tirbeo-blue-500 focus-visible:border-tirbeo-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-tirbeo-red-500 focus-visible:ring-tirbeo-red-500"
              : "border-tirbeo-neutral-300 hover:border-tirbeo-neutral-400",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-tirbeo-red-500">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
