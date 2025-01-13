import { Service } from "typedi";
import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import path from "path";

@Service()
export class DatabaseService {
  private db: Database | null = null;

  // Conecta con la base de datos
  async connect(): Promise<Database> {
    if (this.db) return this.db;

    this.db = await open({
      filename: path.resolve(__dirname, "../data/database.db"), // Ruta a la base de datos SQLite
      driver: sqlite3.Database,
    });

    await this.db.exec("PRAGMA foreign_keys = ON");
    return this.db;
  }

  // Inicializa las tablas en la base de datos
  async initializeDatabase(): Promise<void> {
    const db = await this.connect();

    const tableCreationScripts = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Patient', 'Doctor', 'Admin')),
            department TEXT DEFAULT NULL, -- Solo aplicable a doctores
            specialties TEXT DEFAULT NULL -- Solo aplicable a doctores
        );

        CREATE TABLE IF NOT EXISTS specialties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS doctor_specialties (
            doctor_id INTEGER NOT NULL,
            specialty_id INTEGER NOT NULL,
            PRIMARY KEY (doctor_id, specialty_id),
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'Scheduled',
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            diagnosis TEXT NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS record_test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER NOT NULL,
            test_type TEXT NOT NULL,
            result TEXT NOT NULL,
            FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS availability (
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time_slots TEXT NOT NULL,
            PRIMARY KEY (doctor_id, date),
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            details TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `;

    await db.exec(tableCreationScripts);
    console.log("Database tables initialized successfully");
  }

  // Cierra la conexión de la base de datos
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      console.log("Database connection closed");
      this.db = null;
    }
  }

  // Método para validar datos del usuario según su rol
  async validateUserData(role: string, department?: string, specialties?: string[]): Promise<void> {
    if (role === "Doctor" && (!department || !specialties || specialties.length === 0)) {
      throw new Error("Doctors must have a department and at least one specialty.");
    }

    if (role !== "Doctor" && (department || (specialties && specialties.length > 0))) {
      throw new Error("Only doctors can have a department or specialties.");
    }
  }
}
