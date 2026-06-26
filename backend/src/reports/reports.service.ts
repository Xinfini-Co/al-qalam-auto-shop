import { Injectable } from "@nestjs/common";
import type {
  ReportsPayload,
  RevenuePoint,
  ServiceCategory,
  ServiceRevenue,
  TopClient,
} from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, debtorRow, serializeJob } from "../common/serializers";
import { round2, sumPayments } from "../common/money";

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(days = 30): Promise<ReportsPayload> {
    const [payments, items, clients, jobs] = await Promise.all([
      this.prisma.payment.findMany(),
      this.prisma.jobItem.findMany(),
      this.prisma.client.findMany({ include: { jobs: { include: JOB_INCLUDE } } }),
      this.prisma.job.findMany({ include: JOB_INCLUDE }),
    ]);

    const revenueByService = this.serviceRevenue(items);

    const topClients: TopClient[] = clients
      .map((c) => {
        let totalSpent = 0;
        for (const job of c.jobs) totalSpent += serializeJob(job).totals.paid;
        return { clientId: c.id, name: c.name, totalSpent: round2(totalSpent), jobCount: c.jobs.length };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);

    const receivables = jobs
      .map(debtorRow)
      .filter((d) => d.balance > 0.001)
      .sort((a, b) => b.balance - a.balance);

    return {
      revenueByPeriod: this.revenueSeries(payments, days),
      revenueByService,
      topClients,
      receivables,
    };
  }

  private serviceRevenue(items: { category: string; amount: number }[]): ServiceRevenue[] {
    const totals = new Map<ServiceCategory, number>();
    for (const it of items) {
      const c = it.category as ServiceCategory;
      totals.set(c, (totals.get(c) ?? 0) + it.amount);
    }
    return [...totals.entries()]
      .map(([category, revenue]) => ({ category, revenue: round2(revenue) }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private revenueSeries(payments: { amount: number; date: Date }[], days: number): RevenuePoint[] {
    const out: RevenuePoint[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      out.push({ date: d.toISOString(), revenue: sumPayments(payments.filter((p) => dayKey(p.date) === key)) });
    }
    return out;
  }
}
