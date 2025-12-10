"use client"

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = "", size = 80 }: LogoProps) {
  return (
    <img
      src="/assets/logo/destinypallogo.png"
      alt="DestinyPal Logo"
      width={size}
      height={size}
      className={`object-contain drop-shadow-md ${className}`}
    />
  )
}
