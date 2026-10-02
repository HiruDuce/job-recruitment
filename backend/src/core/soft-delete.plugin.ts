import { Schema, Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { IUser } from '../decorator/customize';

export function softDeletePlugin(schema: Schema) {
  const filterNonDeleted = function (this: any) {
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'updateOne', 'updateMany'], filterNonDeleted);
}

export async function softDelete<T>(
  model: Model<T>,
  id: string,
  user?: IUser,
): Promise<{ matchedCount: number; modifiedCount: number }> {
  const updateData: Record<string, any> = {
    isDeleted: true,
    deletedAt: new Date(),
  };

  if (user) {
    updateData.deletedBy = {
      _id: user._id,
      email: user.email,
    };
  }

  const result = await model.updateOne({ _id: id } as any, updateData as any);
  if (result.matchedCount === 0) {
    throw new NotFoundException(`Không tìm thấy bản ghi với id: ${id}`);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
}
