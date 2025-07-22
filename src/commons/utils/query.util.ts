import { MetaData } from '../types/common.type';

export class QueryUtil {
  static calculateMeta(page: number, limit: number, total: number): MetaData {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
