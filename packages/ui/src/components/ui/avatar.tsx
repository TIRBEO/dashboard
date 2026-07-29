import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-tirbeo-blue-100 text-tirbeo-blue-600 font-medium overflow-hidden flex-shrink-0",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || ""} className="w-full h-full object-cover" />
        ) : (
          <span>{fallback || "?"}</span>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
