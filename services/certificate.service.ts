import { apiClient } from '@/lib/apiClient';

export interface Certificate {
  id: string;
  participantName: string;
  courseName: string;
  courseUrl: string;
  issuedAt: string;
  blockchainHash: string;
}

export interface VerificationResult {
  isValid: boolean;
  message: string;
  blockIndex: number | null;
  previousHash: string | null;
  blockHash: string | null;
  timestamp: string | null;
  certificate: Certificate | null;
}

export class CertificateService {
  /**
   * Generates a unique certificate registered on the blockchain.
   */
  static async generate(data: { participantName: string; courseName: string; courseUrl: string }): Promise<Certificate> {
    const response = await apiClient.post<Certificate>('/certificates', data);
    return response.data;
  }

  /**
   * Retrieves all certificates.
   */
  static async getAll(): Promise<Certificate[]> {
    const response = await apiClient.get<Certificate[]>('/certificates');
    return response.data;
  }

  /**
   * Retrieves a certificate by its UUID.
   */
  static async getById(id: string): Promise<Certificate> {
    const response = await apiClient.get<Certificate>(`/certificates/${id}`);
    return response.data;
  }

  /**
   * Retrieves a certificate by its blockchain block hash.
   */
  static async getByHash(hash: string): Promise<Certificate> {
    const response = await apiClient.get<Certificate>(`/certificates/hash/${hash}`);
    return response.data;
  }

  /**
   * Verifies the cryptographic chain integrity for a certificate hash.
   */
  static async verify(hash: string): Promise<VerificationResult> {
    const response = await apiClient.get<VerificationResult>(`/certificates/verify/${hash}`);
    return response.data;
  }
}
