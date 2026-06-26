import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  phone1: string;

  @IsOptional() @IsString()
  phone2?: string | null;

  @IsOptional() @IsString()
  phone3?: string | null;

  @IsOptional() @IsString()
  address?: string | null;
}

export class UpdateClientDto {
  @IsOptional() @IsString() @MinLength(2)
  name?: string;

  @IsOptional() @IsString() @MinLength(3)
  phone1?: string;

  @IsOptional() @IsString()
  phone2?: string | null;

  @IsOptional() @IsString()
  phone3?: string | null;

  @IsOptional() @IsString()
  address?: string | null;
}
