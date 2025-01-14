import { Service } from "typedi";
import { AuditRepository } from "./audit.repository";
import { AuditLog } from "./audit.model";

@Service()
export class AuditService {
  constructor(private auditRepository: AuditRepository) {}

  async logAction(userId: number, action: string): Promise<number> {
    return this.auditRepository.createLog({ userId, action });
  }

  async getLogs(filters: { userId?: number; action?: string; date?: string }): Promise<AuditLog[]> {
    return this.auditRepository.getLogs(filters);
  }
}
