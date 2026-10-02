import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BaseSchema, AuditUser } from '../../core/base.schema';
import { Company } from '../../companies/schemas/company.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { User } from '../../users/schemas/user.schema';

export const RESUME_STATUS = [
  'PENDING',
  'REVIEWING',
  'APPROVED',
  'REJECTED',
] as const;
export type ResumeStatus = (typeof RESUME_STATUS)[number];

export class ResumeHistory {
  @Prop({ required: true, enum: RESUME_STATUS })
  status: string;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Object, required: true })
  updatedBy: AuditUser;
}

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume extends BaseSchema {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: mongoose.Types.ObjectId | User;

  @Prop({ required: true })
  url: string;

  @Prop({
    required: true,
    enum: RESUME_STATUS,
    default: 'PENDING',
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
  })
  company: mongoose.Types.ObjectId | Company;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Job.name,
    required: true,
  })
  job: mongoose.Types.ObjectId | Job;

  @Prop({ type: [Object], default: [] })
  history: ResumeHistory[];
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);

ResumeSchema.index({ user: 1, job: 1 });
ResumeSchema.index({ company: 1 });
ResumeSchema.index({ status: 1 });
