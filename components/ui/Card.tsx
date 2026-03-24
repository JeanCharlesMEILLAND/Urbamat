import { cn } from "@/lib/utils";

type CardVariant = "product" | "realisation" | "feature";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  product:
    "bg-white border border-gray-200 hover:border-primary/30 hover:shadow-lg",
  realisation:
    "bg-white border border-gray-200 hover:shadow-lg overflow-hidden",
  feature:
    "bg-neutral-light border border-transparent hover:border-primary/20 hover:shadow-md",
};

function Card({ className, variant = "product", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg transition-all duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardVariant };
