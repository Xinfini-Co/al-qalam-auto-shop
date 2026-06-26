import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import type {
  PaymentMethod,
  ServiceCategory,
  TransportType,
} from "@shared";

const CATEGORIES: ServiceCategory[] = ["DENTING", "PAINTING", "MECHANICAL", "AUTO_ELECTRIC", "AC", "SPARE_PARTS"];
const TRANSPORTS: TransportType[] = ["SELF_DRIVE", "TOWED", "PICKUP", "DELIVERY"];
const METHODS: PaymentMethod[] = ["CASH", "CARD", "BANK_TRANSFER"];

class NewClientDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(3) phone1: string;
  @IsOptional() @IsString() phone2?: string;
}

class NewVehicleDto {
  @IsString() @MinLength(1) plateNo: string;
  @IsString() @MinLength(1) makeModel: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() year?: number;
}

class JobItemDto {
  @IsIn(CATEGORIES) category: ServiceCategory;
  @IsString() @MinLength(1) description: string;
  @IsNumber() @Min(0) qty: number;
  @IsNumber() @Min(0) rate: number;
}

class InitialPaymentDto {
  @IsNumber() @Min(0) amount: number;
  @IsIn(METHODS) method: PaymentMethod;
}

export class CreateJobDto {
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @ValidateNested() @Type(() => NewClientDto) newClient?: NewClientDto;

  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @ValidateNested() @Type(() => NewVehicleDto) newVehicle?: NewVehicleDto;

  @IsString() date: string;
  @IsIn(TRANSPORTS) transportType: TransportType;
  @IsOptional() @IsString() mechanicName?: string;
  @IsOptional() @IsString() promisedDate?: string;
  @IsOptional() @IsString() notes?: string;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => JobItemDto)
  items: JobItemDto[];

  @IsOptional() @ValidateNested() @Type(() => InitialPaymentDto) initialPayment?: InitialPaymentDto;
}

export class UpdateStatusDto {
  @IsIn(["PENDING", "IN_PROGRESS", "COMPLETED", "READY_FOR_PICKUP"])
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "READY_FOR_PICKUP";
}
