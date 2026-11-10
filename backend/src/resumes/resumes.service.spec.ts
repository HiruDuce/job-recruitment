jest.mock('../mail/mail.service', () => ({ MailService: class { } }));

import { BadRequestException, NotFoundException } from '@nestjs/common';
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

describe('ResumesService.updateStatus', () => {
    const admin = { _id: 'admin_1', email: 'admin@itjobs.local', role: { name: 'ADMIN' } } as any;
    const hr = { _id: 'hr_1', email: 'hr@itjobs.local', role: { name: 'HR' }, company: 'company_1' } as any;

    // findOneAndUpdate(...).populate(...).populate(...).populate(...) rồi await: tạo một chuỗi giả trả về `result`
    const query = (result: any) => {
        const q: any = {
            populate: jest.fn(() => q),
            then: (ok: any, fail: any) => Promise.resolve(result).then(ok, fail),
        };
        return q;
    };

    const setup = (updated: any, exists: any = null) => {
        const resumeModel = {
            findOneAndUpdate: jest.fn((..._args: any[]) => query(updated)),
            exists: jest.fn().mockResolvedValue(exists),
        };
        const mailService = { send: jest.fn() };
        const service = new ResumesService(resumeModel as any, {} as any, mailService as any);
        return { service, resumeModel, mailService };
    };

    it('chỉ cập nhật khi trạng thái hiện tại khác trạng thái mới', async () => {
        const { service, resumeModel } = setup({ email: 'u@x', status: 'APPROVED' });

        await service.updateStatus('r1', { status: 'APPROVED' }, admin);
        expect(resumeModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'r1', status: { $ne: 'APPROVED' } },
            expect.anything(),
            expect.anything(),
        );
    });

    it('đổi sang đúng trạng thái đang có: trả 400 và không gửi email', async () => {
        const { service, mailService } = setup(null, { _id: 'r1' });

        await expect(service.updateStatus('r1', { status: 'APPROVED' }, admin)).rejects.toThrow(
            BadRequestException,
        );
        expect(mailService.send).not.toHaveBeenCalled();
    });

    it('hồ sơ không tồn tại: trả 404', async () => {
        const { service } = setup(null, null);

        await expect(service.updateStatus('r1', { status: 'APPROVED' }, admin)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('HR: kiểm tra tồn tại vẫn giới hạn trong công ty của mình (chống IDOR)', async () => {
        const { service, resumeModel } = setup(null, null);

        await expect(service.updateStatus('r1', { status: 'APPROVED' }, hr)).rejects.toThrow(
            NotFoundException,
        );
        expect(resumeModel.exists).toHaveBeenCalledWith({ _id: 'r1', company: 'company_1' });
    });

    it('đổi trạng thái thành công: gửi đúng 1 email', async () => {
        const { service, mailService } = setup({ email: 'u@x', status: 'APPROVED' });

        await service.updateStatus('r1', { status: 'APPROVED' }, admin);
        expect(mailService.send).toHaveBeenCalledTimes(1);
    });
});
