import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

export interface InputWithIcon
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIcon>(
  ({ className, startIcon: StartIcon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-10 items-center rounded-md border border-input pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {StartIcon && <StartIcon className="w-4 h-4" />}
        <input
          {...props}
          ref={ref}
          className="w-full m-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
