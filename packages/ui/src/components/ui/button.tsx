import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tirbeo-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-tirbeo-blue-500 text-white shadow-sm hover:bg-tirbeo-blue-600 active:bg-tirbeo-blue-700",
        destructive:
          "bg-tirbeo-red-500 text-white shadow-sm hover:bg-tirbeo-red-600",
        outline:
          "border border-tirbeo-neutral-300 bg-white text-tirbeo-neutral-700 hover:bg-tirbeo-neutral-50 hover:text-tirbeo-neutral-900 active:bg-tirbeo-neutral-100",
        secondary:
          "bg-tirbeo-neutral-100 text-tirbeo-neutral-900 hover:bg-tirbeo-neutral-200 active:bg-tirbeo-neutral-300",
        ghost:
          "text-tirbeo-neutral-700 hover:bg-tirbeo-neutral-100 hover:text-tirbeo-neutral-900",
        danger:
          "bg-tirbeo-red-500 text-white shadow-sm hover:bg-tirbeo-red-600 active:bg-tirbeo-red-700",
        link:
          "text-tirbeo-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-base rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        iconSm: "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
