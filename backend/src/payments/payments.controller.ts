import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list() {
    return this.payments.list();
  }

  @Get("accounting")
  accounting() {
    return this.payments.accounting();
  }

  @Post()
  add(@Body() dto: CreatePaymentDto) {
    return this.payments.add(dto);
  }
}
