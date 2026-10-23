import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectQueue('mail') private mailQueue: Queue,
  ) {
    const host = this.configService.get<string>('MAIL_HOST') || 'localhost';
    const port = Number(this.configService.get<number>('MAIL_PORT') || 1025);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    const auth = user && pass ? { user, pass } : undefined;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth,
    });
  }

  // Ghi việc gửi email vào hàng đợi; worker (mail.processor.ts) sẽ gửi và tự thử lại khi lỗi
  async send(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      await this.mailQueue.add(
        'send',
        { to, subject, template, context },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: 1000, // chỉ giữ 1000 việc thất bại gần nhất để điều tra, tránh đầy Redis
        },
      );
    } catch (error: any) {
      this.logger.error(`Không đưa được email tới ${to} vào hàng đợi: ${error?.message}`);
    }
  }

  // Gửi email thật. Lỗi thì ném ra để BullMQ biết mà thử lại
  async deliver(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    const templatePath = path.join(__dirname, 'templates', `${template}.hbs`);
    const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
    const html = Handlebars.compile(templateContent)(context);

    const from =
      this.configService.get<string>('MAIL_FROM') ||
      '"ITJobs" <no-reply@itjobs.local>';

    await this.transporter.sendMail({ from, to, subject, html });

    this.logger.log(`Email successfully sent to ${to} with template ${template}`);
  }
}
