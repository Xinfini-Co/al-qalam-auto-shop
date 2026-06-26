import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { PaymentMethod } from "@shared";

export class CreatePaymentDto {
  @IsString()
  jobId: string;

  @IsNumber() @Min(0.01)
  amount: number;

  @IsIn(["CASH", "CARD", "BANK_TRANSFER"])
  method: PaymentMethod;

  @IsOptional() @IsString()
  note?: string;
}
