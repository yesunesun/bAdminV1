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
          "flex h-14 w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base transition-all",
          "shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400",
          "focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100",
          "hover:border-slate-300 hover:shadow-[0_3px_6px_rgba(0,0,0,0.04)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200",
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