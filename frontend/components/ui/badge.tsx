import * as React from "react";
import { cn } from "@/lib/utils";
import type { JobStatus, PaymentStatus } from "@shared";
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
} from "@/lib/constants";

function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <Badge className={cn(STATUS_STYLE[status], className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(PAYMENT_STATUS_STYLE[status], className)}>
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export { Badge };
