import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { ClientWithStats } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, serializeClient, serializeJob, serializeVehicle } from "../common/serializers";
import { CreateClientDto, UpdateClientDto } from "./dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search = ""): Promise<ClientWithStats[]> {
    const clients = await this.prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone1: { contains: search } },
              { phone2: { contains: search } },
              { phone3: { contains: search } },
            ],
          }
        : undefined,
      include: { vehicles: true, jobs: { include: JOB_INCLUDE } },
      orderBy: { name: "asc" },
    });

    return clients.map((c) => this.withStats(c));
  }

  async getOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: true,
        jobs: { include: JOB_INCLUDE, orderBy: { date: "desc" } },
      },
    });
    if (!client) throw new NotFoundException("Client not found");
    const stats = this.withStats(client);
    return { ...stats, jobs: client.jobs.map(serializeJob) };
  }

  async create(dto: CreateClientDto) {
    const c = await this.prisma.client.create({ data: { ...dto } });
    return serializeClient(c);
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.ensure(id);
    const c = await this.prisma.client.update({ where: { id }, data: { ...dto } });
    return serializeClient(c);
  }

  async remove(id: string) {
    await this.ensure(id);
    const jobs = await this.prisma.job.count({ where: { clientId: id } });
    if (jobs > 0) throw new BadRequestException("Cannot delete a client with existing jobs");
    await this.prisma.client.delete({ where: { id } });
    return { ok: true as const };
  }

  private async ensure(id: string) {
    const exists = await this.prisma.client.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Client not found");
  }

  private withStats(c: any): ClientWithStats {
    let totalSpent = 0;
    let totalOutstanding = 0;
    for (const job of c.jobs ?? []) {
      const { totals } = serializeJob(job);
      totalSpent += totals.paid;
      totalOutstanding += totals.balance;
    }
    return {
      ...serializeClient(c),
      vehicles: (c.vehicles ?? []).map(serializeVehicle),
      jobCount: (c.jobs ?? []).length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    };
  }
}
