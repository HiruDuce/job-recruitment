import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async send(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        `${template}.hbs`,
      );

      const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent);
      const html = compiled(context);

      const from =
        this.configService.get<string>('MAIL_FROM') ||
        '"ITJobs" <no-reply@itjobs.local>';

      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email successfully sent to ${to} with template ${template}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to} (template: ${template}): ${error?.message}`,
        error?.stack,
      );
    }
  }
}
