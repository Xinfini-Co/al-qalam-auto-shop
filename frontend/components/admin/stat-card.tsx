import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "magenta",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  accent?: "red" | "magenta" | "blue" | "green" | "amber";
}) {
  const accents: Record<string, string> = {
    red: "text-brand-red bg-brand-red/10",
    magenta: "text-brand-magenta bg-brand-magenta/10",
    blue: "text-brand-blue bg-brand-blue/10",
    green: "text-success bg-success/10",
    amber: "text-warning bg-warning/10",
  };

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
