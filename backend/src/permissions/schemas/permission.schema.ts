import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../core/base.schema';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  apiPath: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  module: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index(
  { apiPath: 1, method: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
