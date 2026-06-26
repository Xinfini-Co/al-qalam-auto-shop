"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import type { JobWithRelations } from "@shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceSheet } from "./invoice-sheet";

const PAGE_STYLE = `
  @page { size: A4; margin: 12mm; }
  @media print {
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
  }
`;

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  job,
  variant,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  job: JobWithRelations;
  variant: "client" | "shop";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: `AlQalam-Invoice-${job.jobNo}${variant === "shop" ? "-shop" : ""}`,
    pageStyle: PAGE_STYLE,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[860px] p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-4 pr-6">
          <span>{variant === "shop" ? "Shop copy" : "Client invoice"} · No. {job.jobNo}</span>
          <Button variant="brand" size="sm" onClick={handlePrint}>
            <Printer className="size-4" /> Print
          </Button>
        </DialogTitle>
      </DialogHeader>
      <div className="overflow-x-auto rounded-lg border border-border bg-zinc-100 p-3 dark:bg-zinc-800">
        <InvoiceSheet ref={ref} job={job} variant={variant} />
      </div>
    </Dialog>
  );
}
