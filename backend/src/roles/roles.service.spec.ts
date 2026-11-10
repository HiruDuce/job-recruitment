import { BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';

describe('RolesService.update', () => {
    const user = { _id: 'admin_1', email: 'admin@itjobs.local' } as any;

    // Tạo service với roleModel giả: findById trả về role có tên roleName
    const setup = (roleName: string) => {
        const roleModel = {
            findById: jest.fn().mockResolvedValue({ _id: 'role_1', name: roleName }),
            findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'role_1', name: roleName }),
        };
        return { service: new RolesService(roleModel as any), roleModel };
    };

    it('chặn sửa permissions của role ADMIN, kể cả mảng rỗng', async () => {
        const { service, roleModel } = setup('ADMIN');

        await expect(
            service.update('role_1', { permissions: [] }, user),
        ).rejects.toThrow(BadRequestException);
        expect(roleModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('vẫn cho sửa permissions của role khác', async () => {
        const { service, roleModel } = setup('HR');

        await service.update('role_1', { permissions: ['p1'] }, user);
        expect(roleModel.findByIdAndUpdate).toHaveBeenCalled();
    });
});
