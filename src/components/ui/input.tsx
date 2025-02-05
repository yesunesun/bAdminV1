import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm transition-colors placeholder:text-muted-foreground",
          
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          
          // Hover state
          "hover:border-primary/50",
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          // File input specific
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "file:text-primary file:hover:text-primary/80",
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }