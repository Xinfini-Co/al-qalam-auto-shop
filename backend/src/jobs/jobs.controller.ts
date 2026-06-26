import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import type { JobStatus } from "@shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JobsService } from "./jobs.service";
import { CreateJobDto, UpdateStatusDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(@Query("search") search?: string, @Query("status") status?: JobStatus | "ALL") {
    return this.jobs.list(search ?? "", status ?? "ALL");
  }

  @Get("next-no")
  nextNo() {
    return this.jobs.nextJobNo().then((jobNo) => ({ jobNo }));
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.jobs.getOne(id);
  }

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobs.create(dto);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.jobs.updateStatus(id, dto.status);
  }
}
