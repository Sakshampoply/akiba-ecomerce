import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-[#2a2a3d] bg-[#12121a] px-3 py-2 text-sm text-[#f0f0ff] placeholder:text-[#555577] transition-colors",
          "focus-visible:outline-none focus-visible:border-[#ff2d55] focus-visible:ring-1 focus-visible:ring-[#ff2d55]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
