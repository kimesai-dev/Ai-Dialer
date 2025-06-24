"use client"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function Toaster({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { toasts, dismiss } = useToast()

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-2", className)} {...props}>
      {toasts.map(({ id, ...toast }) => (
        <Toast
          key={id}
          {...toast}
          onOpenChange={(open) => {
            if (!open) dismiss(id)
          }}
          className={cn(
            "transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in slide-in-from-right-5",
            toast.className
          )}
        />
      ))}
    </div>
  )
}
