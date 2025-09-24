import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  neonGlow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, neonGlow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-morphism rounded-lg",
          neonGlow && "neon-glow",
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
