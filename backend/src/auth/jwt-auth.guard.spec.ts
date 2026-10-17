import { hasPermission } from './jwt-auth.guard';
import { IUser } from '../decorator/customize';

describe('hasPermission pure function', () => {
  const dummyUser: IUser = {
    _id: 'user_123',
    name: 'Test Candidate',
    email: 'test@itjobs.local',
    role: {
      _id: 'role_user',
      name: 'NORMAL_USER',
    },
    permissions: [
      { method: 'POST', apiPath: '/api/v1/resumes' },
      { method: 'GET', apiPath: '/api/v1/jobs' },
      { method: 'GET', apiPath: '/api/v1/jobs/:id' },
    ],
  };

  it('should return true for exact matching method and apiPath', () => {
    expect(hasPermission(dummyUser, 'POST', '/api/v1/resumes')).toBe(true);
    expect(hasPermission(dummyUser, 'GET', '/api/v1/jobs/:id')).toBe(true);
  });

  it('should return false when method does not match', () => {
    expect(hasPermission(dummyUser, 'DELETE', '/api/v1/resumes')).toBe(false);
    expect(hasPermission(dummyUser, 'PATCH', '/api/v1/jobs/:id')).toBe(false);
  });

  it('should return false when path does not match (/api/v1/jobs/:id !== /api/v1/jobs)', () => {
    expect(hasPermission(dummyUser, 'POST', '/api/v1/jobs')).toBe(false);
    expect(
      hasPermission(
        {
          ...dummyUser,
          permissions: [{ method: 'GET', apiPath: '/api/v1/jobs' }],
        },
        'GET',
        '/api/v1/jobs/:id',
      ),
    ).toBe(false);
  });

  it('should return false if user or permissions is missing or empty', () => {
    expect(hasPermission(null, 'GET', '/api/v1/jobs')).toBe(false);
    expect(hasPermission(undefined, 'GET', '/api/v1/jobs')).toBe(false);
    expect(
      hasPermission(
        { ...dummyUser, permissions: [] },
        'GET',
        '/api/v1/jobs',
      ),
    ).toBe(false);
  });
});
