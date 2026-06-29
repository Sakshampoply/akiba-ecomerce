import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/20",
        secondary: "bg-[#7c3aed]/10 text-[#8b5cf6] border border-[#7c3aed]/20",
        gold: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20",
        success: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
        error: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20",
        outline: "border border-[#2a2a3d] text-[#8888aa]",
        dark: "bg-[#1a1a27] text-[#8888aa] border border-[#2a2a3d]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
