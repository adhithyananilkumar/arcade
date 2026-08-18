import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('UserService — profile loading', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getMe() loads the private profile from /users/me', async () => {
    (api.get as any).mockResolvedValue({ id: '1', email: 'a@b.com' });
    const result = await UserService.getMe();
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/me');
    expect(result).toEqual({ id: '1', email: 'a@b.com' });
  });

  it('surfaces a loading failure instead of swallowing it', async () => {
    (api.get as any).mockRejectedValue(new Error('server down'));
    await expect(UserService.getMe()).rejects.toThrow('server down');
  });
});

describe('UserService — public vs private profile separation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getPublicProfile() calls the public-by-username endpoint, distinct from the private /me endpoint', async () => {
    (api.get as any).mockResolvedValue({ username: 'someone', firstName: 'A' });
    await UserService.getPublicProfile('someone');
    expect(api.get).toHaveBeenCalledWith('/api/v1/public/profiles/someone');
  });

  it('getMyTimeActivity() calls the self-service endpoint and takes no username/id parameter — a caller structurally cannot request anyone\'s activity but their own (see PUBLIC_PROFILE_SECURITY.md)', async () => {
    (api.get as any).mockResolvedValue([]);
    await UserService.getMyTimeActivity();
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/me/time-activity');
  });
});

describe('UserService — profile editing', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updateProfile() submits the legitimate editable fields to PUT /users/me', async () => {
    (api.put as any).mockResolvedValue({ id: '1', firstName: 'Jane' });
    const result = await UserService.updateProfile('Jane', 'Doe', 'bio', 'https://linkedin.com/x', 'janedoe', '9999999999', 'FEMALE', 'Kochi', 'https://github.com/x');

    expect(api.put).toHaveBeenCalledWith('/api/v1/users/me', {
      firstName: 'Jane',
      lastName: 'Doe',
      bio: 'bio',
      linkedinUrl: 'https://linkedin.com/x',
      username: 'janedoe',
      mobileNumber: '9999999999',
      gender: 'FEMALE',
      address: 'Kochi',
      githubUrl: 'https://github.com/x',
    });
    expect(result).toEqual({ id: '1', firstName: 'Jane' });
  });

  it('propagates a validation/error response instead of pretending the edit succeeded', async () => {
    (api.put as any).mockRejectedValue(new Error('Username already taken'));
    await expect(UserService.updateProfile('Jane', 'Doe')).rejects.toThrow('Username already taken');
  });

  it('checkUsername() queries availability with the candidate username', async () => {
    (api.get as any).mockResolvedValue({ available: false, suggestions: ['jane2', 'jane_doe'] });
    const result = await UserService.checkUsername('jane');
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/check-username?username=jane');
    expect(result.available).toBe(false);
  });
});

describe('UserService — avatar states', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploadAvatar() sends the file as multipart form data', async () => {
    (api.post as any).mockResolvedValue({ id: '1', avatarUrl: '/avatars/x.png' });
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const result = await UserService.uploadAvatar(file);

    expect(api.post).toHaveBeenCalledWith('/api/v1/users/me/avatar', expect.any(FormData));
    const formData = (api.post as any).mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(result.avatarUrl).toBe('/avatars/x.png');
  });

  it('surfaces an upload failure (e.g. rejected by backend validation) rather than a silent no-op', async () => {
    (api.post as any).mockRejectedValue(new Error('Unsupported file type'));
    const file = new File(['x'], 'bad.txt', { type: 'text/plain' });
    await expect(UserService.uploadAvatar(file)).rejects.toThrow('Unsupported file type');
  });

  it('removeAvatar() calls DELETE on the avatar endpoint', async () => {
    (api.delete as any).mockResolvedValue({ id: '1', avatarUrl: null });
    const result = await UserService.removeAvatar();
    expect(api.delete).toHaveBeenCalledWith('/api/v1/users/me/avatar');
    expect(result.avatarUrl).toBeNull();
  });
});
