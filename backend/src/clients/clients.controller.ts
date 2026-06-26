import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientsService } from "./clients.service";
import { CreateClientDto, UpdateClientDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  list(@Query("search") search?: string) {
    return this.clients.list(search ?? "");
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.clients.getOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.clients.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clients.remove(id);
  }
}
