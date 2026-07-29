import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-tirbeo-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-tirbeo-blue-100 text-tirbeo-blue-700",
        secondary:
          "bg-tirbeo-neutral-100 text-tirbeo-neutral-700",
        success:
          "bg-tirbeo-green-50 text-tirbeo-green-700",
        warning:
          "bg-tirbeo-yellow-50 text-tirbeo-yellow-600",
        destructive:
          "bg-tirbeo-red-50 text-tirbeo-red-600",
        outline:
          "border border-tirbeo-neutral-300 text-tirbeo-neutral-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
