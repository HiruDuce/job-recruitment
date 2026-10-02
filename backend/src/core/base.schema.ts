import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class AuditUser {
  _id: mongoose.Types.ObjectId;
  email: string;
}

@Schema({ timestamps: true })
export class BaseSchema {
  @Prop({ type: Object })
  createdBy?: AuditUser;

  @Prop({ type: Object })
  updatedBy?: AuditUser;

  @Prop({ type: Object })
  deletedBy?: AuditUser;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
