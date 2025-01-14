import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { AuditLog } from "./audit.model";

@Service()
export class AuditRepository {
  constructor(private dbService: DatabaseService) {}

  async createLog(log: AuditLog): Promise<number> {
    const result = await this.dbService.execQuery(
      `INSERT INTO audit_logs (userId, action) VALUES (?, ?)`,
      [log.userId, log.action]
    );
    return (result as any).lastID;
  }

  async getLogs(filters: { userId?: number; action?: string; date?: string }): Promise<AuditLog[]> {
    const conditions = [];
    const params = [];

    if (filters.userId) {
      conditions.push("userId = ?");
      params.push(filters.userId);
    }
    if (filters.action) {
      conditions.push("action LIKE ?");
      params.push(`%${filters.action}%`);
    }
    if (filters.date) {
      conditions.push("DATE(timestamp) = ?");
      params.push(filters.date);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.dbService.execQuery(
      `SELECT * FROM audit_logs ${whereClause}`,
      params
    );

    return result;
  }
}
