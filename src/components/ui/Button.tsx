import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const VARIANTS = {
  primary:
    "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20 hover:brightness-110",
  outline: "border border-primary/40 text-primary hover:bg-primary/10",
  ghost: "text-foreground hover:bg-white/5",
  whatsapp: "bg-[#25d366] text-white hover:brightness-110",
} as const;

type Variant = keyof typeof VARIANTS;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}
