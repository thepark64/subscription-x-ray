"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackCtaClick } from "@/lib/analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  trackLocation: string;
  trackLabel: string;
};

export default function TrackedLink({
  trackLocation,
  trackLabel,
  href,
  onClick,
  children,
  ...rest
}: TrackedLinkProps) {
  const destination = typeof href === "string" ? href : href.pathname ?? "";

  return (
    <Link
      href={href}
      onClick={(e) => {
        trackCtaClick(trackLocation, trackLabel, destination);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
