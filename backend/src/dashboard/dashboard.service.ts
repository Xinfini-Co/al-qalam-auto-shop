import { Injectable } from "@nestjs/common";
import type { DashboardPayload, JobStatus, RevenuePoint, StatusCount } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, debtorRow, serializeJob } from "../common/serializers";
import { round2, sumPayments } from "../common/money";

const ALL_STATUSES: JobStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "READY_FOR_PICKUP"];
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<DashboardPayload> {
    const [jobs, payments] = await Promise.all([
      this.prisma.job.findMany({ include: JOB_INCLUDE }),
      this.prisma.payment.findMany(),
    ]);

    const today = dayKey(new Date());
    const todayRevenue = sumPayments(payments.filter((p) => dayKey(p.date) === today));
    const pendingJobs = jobs.filter((j) => j.status === "PENDING" || j.status === "IN_PROGRESS").length;
    const carsInShop = jobs.filter((j) => j.status !== "COMPLETED").length;

    const outstanding = jobs
      .map(debtorRow)
      .filter((d) => d.balance > 0.001)
      .sort((a, b) => b.balance - a.balance);
    const totalOutstanding = round2(outstanding.reduce((s, d) => s + d.balance, 0));

    const statusBreakdown: StatusCount[] = ALL_STATUSES.map((status) => ({
      status,
      count: jobs.filter((j) => j.status === status).length,
    }));

    const recentJobs = [...jobs]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6)
      .map(serializeJob);

    return {
      stats: { todayRevenue, pendingJobs, carsInShop, totalOutstanding },
      revenue30d: this.revenueSeries(payments, 30),
      statusBreakdown,
      recentJobs,
      outstanding,
    };
  }

  private revenueSeries(payments: { amount: number; date: Date }[], days: number): RevenuePoint[] {
    const out: RevenuePoint[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const revenue = sumPayments(payments.filter((p) => dayKey(p.date) === key));
      out.push({ date: d.toISOString(), revenue });
    }
    return out;
  }
}
