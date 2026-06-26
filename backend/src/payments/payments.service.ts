import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { JobWithRelations, PaymentMethod } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, debtorRow, serializeJob } from "../common/serializers";
import { round2, sumPayments } from "../common/money";
import { CreatePaymentDto } from "./dto";

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const payments = await this.prisma.payment.findMany({
      include: { job: { include: { client: true } } },
      orderBy: { date: "desc" },
    });
    return payments.map((p) => ({
      id: p.id,
      jobId: p.jobId,
      amount: p.amount,
      method: p.method as PaymentMethod,
      date: p.date.toISOString(),
      note: p.note,
      job: { jobNo: p.job.jobNo, clientName: p.job.client.name },
    }));
  }

  async add(dto: CreatePaymentDto): Promise<JobWithRelations> {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId }, include: JOB_INCLUDE });
    if (!job) throw new NotFoundException("Job not found");

    const { totals } = serializeJob(job);
    if (dto.amount > totals.balance + 0.001) {
      throw new BadRequestException(`Amount exceeds the remaining balance of ${totals.balance.toFixed(2)}`);
    }

    await this.prisma.payment.create({
      data: { jobId: dto.jobId, amount: dto.amount, method: dto.method, note: dto.note ?? null },
    });

    const updated = await this.prisma.job.findUnique({ where: { id: dto.jobId }, include: JOB_INCLUDE });
    return serializeJob(updated!);
  }

  /** Accounting: daily cash, by method, debtors, monthly + 30-day series. */
  async accounting() {
    const [allPayments, jobs] = await Promise.all([
      this.prisma.payment.findMany(),
      this.prisma.job.findMany({ include: JOB_INCLUDE }),
    ]);

    const today = dayKey(new Date());
    const todays = allPayments.filter((p) => dayKey(p.date) === today);
    const collectedToday = sumPayments(todays);

    const byMethod = (["CASH", "CARD", "BANK_TRANSFER"] as const).map((method) => ({
      method,
      amount: sumPayments(todays.filter((p) => p.method === method)),
    }));

    const debtors = jobs
      .map(debtorRow)
      .filter((d) => d.balance > 0.001)
      .sort((a, b) => b.balance - a.balance);
    const totalOutstanding = round2(debtors.reduce((s, d) => s + d.balance, 0));

    return {
      collectedToday,
      byMethod,
      debtors,
      totalOutstanding,
      monthly: this.monthlySeries(allPayments, 6),
      last30: this.dailySeries(allPayments, 30),
    };
  }

  monthlySeries(payments: { amount: number; date: Date }[], months: number) {
    const out: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const revenue = sumPayments(payments.filter((p) => p.date.toISOString().slice(0, 7) === key));
      out.push({ month: d.toLocaleDateString("en-GB", { month: "short" }), revenue });
    }
    return out;
  }

  dailySeries(payments: { amount: number; date: Date }[], days: number) {
    const out: { date: string; revenue: number }[] = [];
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
