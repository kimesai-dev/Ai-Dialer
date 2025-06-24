"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export type ToastActionElement = React.ReactElement

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm rounded-md border bg-background p-4 shadow-lg",
        className,
      )}
      {...props}
    >
      <div className="flex-1">
        {title && <p className="text-sm font-semibold mb-1">{title}</p>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
)
Toast.displayName = "Toast"
