import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  description?: string
  retry?: () => void
  className?: string
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An error occurred while loading this content. Please try again.",
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {retry && (
        <Button onClick={retry} className="mt-6">
          Try again
        </Button>
      )}
    </div>
  )
}