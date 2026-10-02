import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../core/base.schema';
import { Company } from '../../companies/schemas/company.schema';

export const LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'] as const;
export type JobLevel = (typeof LEVELS)[number];

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [String] })
  skills: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
  })
  company: mongoose.Types.ObjectId | Company;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 0 })
  salary: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, enum: LEVELS })
  level: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({ skills: 1 });
JobSchema.index({ company: 1 });
JobSchema.index({ isActive: 1, endDate: 1 });
