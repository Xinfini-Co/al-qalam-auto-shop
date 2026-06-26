import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { VehicleWithClient } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto, UpdateVehicleDto } from "./dto";

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search = ""): Promise<VehicleWithClient[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { plateNo: { contains: search } },
              { makeModel: { contains: search } },
              { client: { name: { contains: search } } },
            ],
          }
        : undefined,
      include: { client: true, _count: { select: { jobs: true } } },
      orderBy: { makeModel: "asc" },
    });

    return vehicles.map((v) => ({
      id: v.id,
      clientId: v.clientId,
      plateNo: v.plateNo,
      makeModel: v.makeModel,
      color: v.color,
      year: v.year,
      client: { id: v.client.id, name: v.client.name, phone1: v.client.phone1 },
      jobCount: v._count.jobs,
    }));
  }

  async create(dto: CreateVehicleDto) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new BadRequestException("Owner (client) not found");
    return this.prisma.vehicle.create({ data: { ...dto } });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.ensure(id);
    return this.prisma.vehicle.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    await this.ensure(id);
    const jobs = await this.prisma.job.count({ where: { vehicleId: id } });
    if (jobs > 0) throw new BadRequestException("Cannot delete a vehicle with existing jobs");
    await this.prisma.vehicle.delete({ where: { id } });
    return { ok: true as const };
  }

  private async ensure(id: string) {
    const exists = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Vehicle not found");
  }
}
