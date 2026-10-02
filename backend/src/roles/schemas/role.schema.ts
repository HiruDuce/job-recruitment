import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../core/base.schema';
import { Permission } from '../../permissions/schemas/permission.schema';

export const ADMIN_ROLE = 'ADMIN';
export const HR_ROLE = 'HR';
export const USER_ROLE = 'NORMAL_USER';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role extends BaseSchema {
  @Prop({ required: true, uppercase: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Permission.name }] })
  permissions: mongoose.Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
