import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold tracking-wide uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d55] disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#ff2d55] text-white hover:bg-[#ff4d6d] active:scale-[0.98] shadow-lg shadow-[#ff2d55]/20",
        secondary:
          "bg-[#7c3aed] text-white hover:bg-[#8b5cf6] active:scale-[0.98] shadow-lg shadow-[#7c3aed]/20",
        outline:
          "border border-[#2a2a3d] bg-transparent text-[#f0f0ff] hover:border-[#ff2d55] hover:text-[#ff2d55] active:scale-[0.98]",
        ghost:
          "bg-transparent text-[#8888aa] hover:bg-[#1a1a27] hover:text-[#f0f0ff]",
        destructive:
          "bg-[#ef4444] text-white hover:bg-red-600 active:scale-[0.98]",
        link: "text-[#ff2d55] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
