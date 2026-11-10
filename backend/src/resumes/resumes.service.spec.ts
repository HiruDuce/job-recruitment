jest.mock('../mail/mail.service', () => ({ MailService: class { } }));

import { BadRequestException } from '@nestjs/common';
import { ResumesService } from './resumes.service';

describe('ResumesService.create', () => {
    const user = { _id: 'user_1', email: 'user@itjobs.local' } as any;
    const dto = { url: '/images/resume/cv.pdf', job: 'job_1' };

    it('DB báo trùng (11000) thì trả 400', async () => {
        const jobModel = {
            findOne: jest.fn().mockResolvedValue({ _id: 'job_1', company: 'company_1' }),
        };
        const resumeModel = {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockRejectedValue({ code: 11000 }),
        };
        const service = new ResumesService(resumeModel as any, jobModel as any, {} as any);

        await expect(service.create(dto, user)).rejects.toThrow(BadRequestException);
    });
});
