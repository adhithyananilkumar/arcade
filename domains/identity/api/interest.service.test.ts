import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InterestService } from './interest.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('InterestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() fetches the public taxonomy', async () => {
    (api.get as any).mockResolvedValue([{ id: '1', name: 'Web Dev', slug: 'web-dev', parentId: null }]);
    const result = await InterestService.list();
    expect(api.get).toHaveBeenCalledWith('/api/v1/public/interests');
    expect(result).toEqual([{ id: '1', name: 'Web Dev', slug: 'web-dev', parentId: null }]);
  });

  it('getMine() fetches the self-service selection', async () => {
    (api.get as any).mockResolvedValue([]);
    await InterestService.getMine();
    expect(api.get).toHaveBeenCalledWith('/api/v1/me/interests');
  });

  it('updateMine() submits canonical interest IDs, not display strings', async () => {
    (api.put as any).mockResolvedValue([{ id: 'a', name: 'AI', slug: 'ai', parentId: null }]);
    await InterestService.updateMine(['a', 'b', 'c']);
    expect(api.put).toHaveBeenCalledWith('/api/v1/me/interests', { interestIds: ['a', 'b', 'c'] });
  });
});
