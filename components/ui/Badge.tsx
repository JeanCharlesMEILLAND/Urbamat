import { cn } from "@/lib/utils";

type BadgeVariant = "info" | "success" | "warning";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-accent-50 text-accent-700 border-accent-200",
};

function Badge({ className, variant = "info", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
