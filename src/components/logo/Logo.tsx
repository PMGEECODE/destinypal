"use client";

type LogoVariant =
  | "destinypal"
  | "mpesa"
  | "airtelmoney"
  | "paypal"
  | "kcb"
  | "equity"
  | "absa"
  | "safaricom"
  | "bankcard";

interface LogoProps {
  variant: LogoVariant;
  className?: string;
  size?: number;
}

const logoSources: Record<LogoVariant, string> = {
  destinypal: "/assets/logo/destinypallogo.png",
  mpesa: "/assets/icons/mpesa.png",
  airtelmoney: "/assets/icons/airtelmoney.png",
  paypal: "/assets/icons/paypal.png",
  kcb: "/assets/icons/kcb.png",
  equity: "/assets/icons/equity.png",
  absa: "/assets/icons/absa.png",
  safaricom: "/assets/icons/safaricom.png",
  bankcard: "/assets/icons/bankcard.png",
};

export default function Logo({
  variant = "destinypal",
  className = "",
  size = 80,
}: LogoProps) {
  const src = logoSources[variant];

  return (
    <img
      src={src}
      alt={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Logo`}
      width={size}
      height={size}
      className={`object-contain drop-shadow-md ${className}`}
    />
  );
}
