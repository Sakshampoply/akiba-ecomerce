"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: "default" | "success" | "error"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-sm border p-4 shadow-xl transition-all",
      "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-4",
      variant === "default" && "border-[#2a2a3d] bg-[#12121a] text-[#f0f0ff]",
      variant === "success" && "border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]",
      variant === "error" && "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]",
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn("rounded-sm opacity-50 hover:opacity-100 transition-opacity", className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs opacity-70", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

// Simple toast state
const toastState = {
  toasts: [] as Array<ToastProps & { id: string; title?: string; description?: string }>,
  listeners: new Set<() => void>(),
  add(toast: Omit<ToastProps, "id"> & { title?: string; description?: string }) {
    const id = Math.random().toString(36).slice(2)
    this.toasts = [...this.toasts, { ...toast, id }]
    this.listeners.forEach((l) => l())
    setTimeout(() => this.remove(id), 4000)
  },
  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.listeners.forEach((l) => l())
  },
}

export function toast(props: Omit<ToastProps, "id"> & { title?: string; description?: string }) {
  toastState.add(props)
}

export function Toaster() {
  const [toasts, setToasts] = React.useState(toastState.toasts)

  React.useEffect(() => {
    const update = () => setToasts([...toastState.toasts])
    toastState.listeners.add(update)
    return () => { toastState.listeners.delete(update) }
  }, [])

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
