import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../core/base.schema';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  logo: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
