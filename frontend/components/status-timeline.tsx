import { Check } from "lucide-react";
import type { JobStatus } from "@shared";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Horizontal (desktop) / vertical (mobile) progress of a job through statuses. */
export function StatusTimeline({ status }: { status: JobStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {STATUS_FLOW.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const reached = i <= currentIndex;
        return (
          <li key={s} className="flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              {/* left/top connector (hidden on first) */}
              <span
                className={cn(
                  "hidden h-0.5 flex-1 sm:block",
                  i === 0 ? "opacity-0" : reached ? "bg-brand-gradient" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-transparent bg-brand-gradient text-white shadow-glow"
                    : done
                      ? "border-transparent bg-success text-white"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden h-0.5 flex-1 sm:block",
                  i === STATUS_FLOW.length - 1 ? "opacity-0" : i < currentIndex ? "bg-brand-gradient" : "bg-border",
                )}
              />
              {/* vertical connector for mobile */}
              {i < STATUS_FLOW.length - 1 && (
                <span
                  className={cn(
                    "my-1 h-6 w-0.5 sm:hidden",
                    i < currentIndex ? "bg-brand-gradient" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pb-4 sm:pb-0">
              <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted-foreground")}>
                {STATUS_LABEL[s]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
