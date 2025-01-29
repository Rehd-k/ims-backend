import { IsOptional, IsString, IsInt, Min, IsJSON } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsJSON()
  filter?: string; // JSON string for filtering

  @IsOptional()
  @IsJSON()
  sort?: string; // JSON string for sorting

  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number; // Number of results per page

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number; // Number of results to skip

  @IsOptional()
  @IsString()
  select?: string; // Comma-separated fields to select
}
