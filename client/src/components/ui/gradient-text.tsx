import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("gradient-text", className)}
        {...props}
      />
    );
  }
);

GradientText.displayName = "GradientText";

export { GradientText };
