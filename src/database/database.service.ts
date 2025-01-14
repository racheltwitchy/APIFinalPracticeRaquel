import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { Service } from "typedi";
import { config } from "../config/environment";
import path from "path";

@Service()
export class DatabaseService {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

  public async openDatabase(): Promise<
    Database<sqlite3.Database, sqlite3.Statement>
  > {
    if (this.db) return this.db;

    console.log(
      "Database path:",
      path.join(__dirname, `../data/${config.dbOptions.database}`)
    );

    this.db = await open({
      filename: path.join(__dirname, `../data/${config.dbOptions.database}`),
      driver: sqlite3.Database,
    });

    await this.db.exec(`PRAGMA foreign_keys = ON;`);
    return this.db;
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  public async execQuery(sql: string, params: any[] = []): Promise<any>   {
    const dbClient = await this.openDatabase();
    try {
      const rows = await dbClient.all(sql, params);
      return rows;
    } finally {
      await this.closeDatabase();
    }
  }

  public async initializeDatabase(): Promise<void> {
    const dbClient = await this.openDatabase();

    // Users Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);

    // Appointments Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        dateTime TEXT NOT NULL,
        FOREIGN KEY(patientId) REFERENCES users(id),
        FOREIGN KEY(doctorId) REFERENCES users(id)
      );
    `);

    // Medical Records Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        record TEXT NOT NULL,
        FOREIGN KEY(patientId) REFERENCES users(id),
        FOREIGN KEY(doctorId) REFERENCES users(id)
      );
    `);

    // Specialties Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS specialties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);

    // Logs Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    await this.closeDatabase();
  }
}
