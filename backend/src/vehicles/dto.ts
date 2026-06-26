import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateVehicleDto {
  @IsString()
  clientId: string;

  @IsString()
  @MinLength(1)
  plateNo: string;

  @IsString()
  @MinLength(1)
  makeModel: string;

  @IsOptional() @IsString()
  color?: string | null;

  @IsOptional() @IsInt() @Min(1980) @Max(2035)
  year?: number | null;
}

export class UpdateVehicleDto {
  @IsOptional() @IsString()
  clientId?: string;

  @IsOptional() @IsString() @MinLength(1)
  plateNo?: string;

  @IsOptional() @IsString() @MinLength(1)
  makeModel?: string;

  @IsOptional() @IsString()
  color?: string | null;

  @IsOptional() @IsInt() @Min(1980) @Max(2035)
  year?: number | null;
}
