import { BadgeCheck } from "lucide-react"

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg"
  className?: string
  tooltip?: string
}

export function VerifiedBadge({ size = "md", className = "", tooltip = "Verified" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <span title={tooltip} className={`inline-flex items-center ${className}`}>
      <BadgeCheck className={`${sizeClasses[size]} text-blue-500`} />
    </span>
  )
}
