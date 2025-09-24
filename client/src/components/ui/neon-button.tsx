import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface NeonButtonProps extends ButtonProps {
  neon?: boolean;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, neon = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          neon && "neon-border hover:neon-glow transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);

NeonButton.displayName = "NeonButton";

export { NeonButton };
