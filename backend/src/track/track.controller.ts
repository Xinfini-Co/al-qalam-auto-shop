import { Controller, Get, Query } from "@nestjs/common";
import type { TrackResult } from "@shared";
import { PrismaService } from "../prisma/prisma.service";
import { JOB_INCLUDE, toTrackResult } from "../common/serializers";

/** Public, unauthenticated job tracking by invoice number or phone. */
@Controller("track")
export class TrackController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async track(@Query("q") q?: string): Promise<TrackResult | null> {
    const query = (q ?? "").trim();
    if (!query) return null;

    // 1) try invoice / job number
    const padded = query.padStart(4, "0");
    let job = await this.prisma.job.findFirst({
      where: { OR: [{ jobNo: padded }, { jobNo: query }] },
      include: JOB_INCLUDE,
    });

    // 2) else match by client phone, returning their latest job
    if (!job) {
      const digits = query.replace(/\D/g, "");
      if (digits.length >= 4) {
        job = await this.prisma.job.findFirst({
          where: {
            client: {
              OR: [
                { phone1: { contains: query } },
                { phone2: { contains: query } },
                { phone3: { contains: query } },
                { phone1: { contains: digits } },
              ],
            },
          },
          include: JOB_INCLUDE,
          orderBy: { date: "desc" },
        });
      }
    }

    return job ? toTrackResult(job) : null;
  }
}
