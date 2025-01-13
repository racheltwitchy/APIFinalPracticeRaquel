import sqlite3 from 'sqlite3'; // Importa sqlite3 correctamente
import { Database, open } from 'sqlite'; // Importa Database y open de sqlite
import { Service } from 'typedi'; // Importa el decorador Service
import path from "path"; // Importa path para construir rutas

// Inicializa la base de datos
@Service() // Este decorador es crucial para que `typedi` registre el servicio
export class DatabaseService {
  private db: Database | null = null;

  async connect(): Promise<Database> {
    if (this.db) return this.db;

    this.db = await open({
      filename: path.resolve(__dirname, "../data/database.db"), // Define la ruta de la base de datos
      driver: sqlite3.Database, // Usa el constructor correcto de sqlite3
    });

    await this.db.exec("PRAGMA foreign_keys = ON"); // Activa las claves foráneas
    return this.db;
  }

  async initializeDatabase(): Promise<void> {
    const db = await this.connect();

    // Crear tablas
    const tableCreationScripts = `
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'admin')),
          specialty_id INTEGER,
          department_id INTEGER,
          FOREIGN KEY (specialty_id) REFERENCES specialties(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
      );

      CREATE TABLE IF NOT EXISTS specialties (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT
      );

      CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          doctor_id INTEGER NOT NULL,
          appointment_date DATETIME NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('scheduled', 'cancelled', 'completed')),
          FOREIGN KEY (patient_id) REFERENCES users(id),
          FOREIGN KEY (doctor_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS medical_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          doctor_id INTEGER NOT NULL,
          diagnosis TEXT NOT NULL,
          treatment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(id),
          FOREIGN KEY (doctor_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipient_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('appointment', 'medical_record')),
          message TEXT NOT NULL,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipient_id) REFERENCES users(id)
      );
    `;

    await db.exec(tableCreationScripts); // Ejecuta los scripts para crear tablas
  }
}
