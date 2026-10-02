import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  current: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @IsOptional()
  @Matches(/^-?[\w.]+$/)
  sort?: string;
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface PaginateResult<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  query: PaginationQueryDto,
  populate?: PopulateOptions | (PopulateOptions | string)[],
): Promise<PaginateResult<T>> {
  const current = query.current;
  const pageSize = query.pageSize;
  const skip = (current - 1) * pageSize;
  const sort = query.sort || '-createdAt';

  let findQuery = model.find(filter).sort(sort).skip(skip).limit(pageSize);
  if (populate) {
    findQuery = findQuery.populate(populate as any);
  }

  const [total, result] = await Promise.all([
    model.countDocuments(filter),
    findQuery.exec(),
  ]);

  const pages = Math.ceil(total / pageSize);

  return {
    meta: {
      current,
      pageSize,
      pages,
      total,
    },
    result,
  };
}
