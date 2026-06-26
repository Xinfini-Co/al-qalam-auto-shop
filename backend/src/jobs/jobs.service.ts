import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { JobStatus, JobWithRelations } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, serializeJob } from "../common/serializers";
import { lineAmount } from "../common/money";
import { CreateJobDto } from "./dto";

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search = "", status: JobStatus | "ALL" = "ALL"): Promise<JobWithRelations[]> {
    const jobs = await this.prisma.job.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { jobNo: { contains: search } },
                { client: { name: { contains: search } } },
                { vehicle: { plateNo: { contains: search } } },
                { vehicle: { makeModel: { contains: search } } },
              ],
            }
          : {}),
      },
      include: JOB_INCLUDE,
      orderBy: { date: "desc" },
    });
    return jobs.map(serializeJob);
  }

  async getOne(id: string): Promise<JobWithRelations> {
    const job = await this.prisma.job.findUnique({ where: { id }, include: JOB_INCLUDE });
    if (!job) throw new NotFoundException("Job not found");
    return serializeJob(job);
  }

  /** Next sequential invoice number — starts at 0457 on an empty database. */
  async nextJobNo(): Promise<string> {
    const jobs = await this.prisma.job.findMany({ select: { jobNo: true } });
    const max = jobs.reduce((m, j) => Math.max(m, parseInt(j.jobNo, 10) || 0), 0);
    return String(Math.max(max, 456) + 1).padStart(4, "0");
  }

  async create(dto: CreateJobDto): Promise<JobWithRelations> {
    // resolve client
    let clientId = dto.clientId;
    if (!clientId && dto.newClient) {
      const c = await this.prisma.client.create({
        data: { name: dto.newClient.name, phone1: dto.newClient.phone1, phone2: dto.newClient.phone2 ?? null },
      });
      clientId = c.id;
    }
    if (!clientId) throw new BadRequestException("A client is required");

    // resolve vehicle
    let vehicleId = dto.vehicleId;
    if (!vehicleId && dto.newVehicle) {
      const v = await this.prisma.vehicle.create({
        data: {
          clientId,
          plateNo: dto.newVehicle.plateNo,
          makeModel: dto.newVehicle.makeModel,
          color: dto.newVehicle.color ?? null,
          year: dto.newVehicle.year ?? null,
        },
      });
      vehicleId = v.id;
    }
    if (!vehicleId) throw new BadRequestException("A vehicle is required");

    const jobNo = await this.nextJobNo();

    const job = await this.prisma.job.create({
      data: {
        jobNo,
        clientId,
        vehicleId,
        date: new Date(dto.date),
        transportType: dto.transportType,
        status: "PENDING",
        mechanicName: dto.mechanicName ?? null,
        notes: dto.notes ?? null,
        promisedDate: dto.promisedDate ? new Date(dto.promisedDate) : null,
        items: {
          create: dto.items.map((it) => ({
            category: it.category,
            description: it.description,
            qty: it.qty,
            rate: it.rate,
            amount: lineAmount(it.qty, it.rate),
          })),
        },
        ...(dto.initialPayment && dto.initialPayment.amount > 0
          ? { payments: { create: { amount: dto.initialPayment.amount, method: dto.initialPayment.method, note: "Initial payment" } } }
          : {}),
      },
      include: JOB_INCLUDE,
    });

    return serializeJob(job);
  }

  async updateStatus(id: string, status: JobStatus): Promise<JobWithRelations> {
    await this.ensure(id);
    const job = await this.prisma.job.update({ where: { id }, data: { status }, include: JOB_INCLUDE });
    return serializeJob(job);
  }

  private async ensure(id: string) {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Job not found");
  }
}
