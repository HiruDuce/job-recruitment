import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { to, subject, template, context } = job.data;
    await this.mailService.deliver(to, subject, template, context);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.warn(
      `Gửi email tới ${job.data.to} thất bại (lần ${job.attemptsMade}/${job.opts.attempts}): ${err.message}`,
    );
  }
}
