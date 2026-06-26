"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenuePoint, ServiceRevenue, StatusCount } from "@shared";
import {
  CATEGORY_CHART_COLOR,
  CATEGORY_LABEL,
  STATUS_CHART_COLOR,
  STATUS_LABEL,
} from "@/lib/constants";
import { formatAED } from "@/lib/utils";

const axisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v: number) => formatAED(v),
}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-soft">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="tabular-nums text-muted-foreground">
          {p.name ? `${p.name}: ` : ""}
          <span className="font-medium text-popover-foreground">{valueFormatter(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  const chartData = data.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    revenue: d.revenue,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B1C8E" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E31937" />
            <stop offset="55%" stopColor="#9B1C8E" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={28} />
        <YAxis {...axisProps} width={48} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="url(#revStroke)"
          strokeWidth={2.5}
          fill="url(#revFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }: { data: StatusCount[] }) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: STATUS_LABEL[d.status], value: d.count, color: STATUS_CHART_COLOR[d.status] }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `${v} job${v === 1 ? "" : "s"}`} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">total jobs</span>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {chartData.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: d.color }} /> {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ServiceBarChart({ data }: { data: ServiceRevenue[] }) {
  const chartData = data.map((d) => ({
    label: CATEGORY_LABEL[d.category],
    revenue: d.revenue,
    color: CATEGORY_CHART_COLOR[d.category],
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" {...axisProps} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
        <YAxis type="category" dataKey="label" {...axisProps} width={92} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]} barSize={20}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="monthBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B1C8E" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={48} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey="revenue" name="Revenue" fill="url(#monthBar)" radius={[6, 6, 0, 0]} barSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
