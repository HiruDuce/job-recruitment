import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  current: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @IsOptional()
  @Matches(/^-?[\w.]+$/)
  sort?: string;
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
  const current = Number(query.current) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const skip = (current - 1) * pageSize;
  const sort = query.sort || '-createdAt';

  const [total, result] = await Promise.all([
    model.countDocuments(filter),
    (async () => {
      let q = model.find(filter).sort(sort).skip(skip).limit(pageSize);
      if (populate) {
        q = q.populate(populate as any);
      }
      return q.exec();
    })(),
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
