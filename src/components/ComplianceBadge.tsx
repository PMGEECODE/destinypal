import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"
import type { ComplianceStatus } from "../types"

interface ComplianceBadgeProps {
  status: ComplianceStatus
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<
  ComplianceStatus,
  {
    icon: typeof Shield
    label: string
    bgColor: string
    textColor: string
    iconColor: string
  }
> = {
  active: {
    icon: Shield,
    label: "Active",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    iconColor: "text-green-600",
  },
  whitelisted: {
    icon: ShieldCheck,
    label: "Whitelisted",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    iconColor: "text-blue-600",
  },
  blacklisted: {
    icon: ShieldX,
    label: "Blacklisted",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    iconColor: "text-red-600",
  },
  suspended: {
    icon: ShieldAlert,
    label: "Suspended",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    iconColor: "text-amber-600",
  },
}

export function ComplianceBadge({ status, size = "md", showLabel = true, className = "" }: ComplianceBadgeProps) {
  const config = statusConfig[status] || statusConfig.active
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  if (!showLabel) {
    return (
      <span title={config.label} className={`inline-flex items-center ${className}`}>
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {config.label}
    </span>
  )
}
