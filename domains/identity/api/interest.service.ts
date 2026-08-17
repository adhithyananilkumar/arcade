import { api } from '@/infrastructure/http/api';

export interface Interest {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export class InterestService {
  static list(): Promise<Interest[]> {
    return api.get<Interest[]>('/api/v1/public/interests');
  }

  static getMine(): Promise<Interest[]> {
    return api.get<Interest[]>('/api/v1/me/interests');
  }

  static updateMine(interestIds: string[]): Promise<Interest[]> {
    return api.put<Interest[]>('/api/v1/me/interests', { interestIds });
  }
}
