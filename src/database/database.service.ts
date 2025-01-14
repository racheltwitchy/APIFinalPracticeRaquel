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
  public async execQuery(sql: string, params: any[] = []): Promise<any> {
    const dbClient = await this.openDatabase();
    const { sql: query, params: queryParams } = { sql, params };
  
    try {
      if (/^INSERT|UPDATE|DELETE/i.test(query)) {
        // Ejecutar consultas de escritura y retornar `lastID`
        const statement = await dbClient.run(query, queryParams);
        return { lastID: statement.lastID, changes: statement.changes };
      } else {
        // Ejecutar consultas de lectura
        const rows: any[] = await dbClient.all(query, queryParams);
        return rows;
      }
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
        role TEXT NOT NULL,
        departmentId INTEGER,
        FOREIGN KEY(departmentId) REFERENCES departments(departmentId)
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
        diagnosis TEXT NOT NULL,
        prescriptions TEXT,
        testResults TEXT,
        ongoingTreatments TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patientId) REFERENCES users(id),
        FOREIGN KEY(doctorId) REFERENCES users(id)
      );
    `);
  
    // Specialties Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS specialties (
        specialtyId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL
      );
    `);
  
    // Departments Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        departmentId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL
      );
    `);
  
    // Department Services Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS department_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        departmentId INTEGER NOT NULL,
        service TEXT NOT NULL,
        FOREIGN KEY(departmentId) REFERENCES departments(departmentId) ON DELETE CASCADE
      );
    `);
  
    // Doctor Specialties Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS doctor_specialties (
        doctorId INTEGER NOT NULL,
        specialtyId INTEGER NOT NULL,
        PRIMARY KEY (doctorId, specialtyId),
        FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (specialtyId) REFERENCES specialties(specialtyId) ON DELETE CASCADE
      );
    `);
  
    // Audit Logs Table
    await dbClient.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);
  
    // Insertar datos por defecto en Users
    await dbClient.exec(`
      INSERT OR IGNORE INTO users (id, username, email, password, role) VALUES
        (1, 'doctor1', 'doctor1@example.com', 'hashed_password', 'doctor'),
        (2, 'doctor2', 'doctor2@example.com', 'hashed_password', 'doctor'),
        (3, 'doctor3', 'doctor3@example.com', 'hashed_password', 'doctor'),
        (4, 'doctor4', 'doctor4@example.com', 'hashed_password', 'doctor');
    `);
  
    // Insertar datos por defecto en Specialties
    await dbClient.exec(`
      INSERT OR IGNORE INTO specialties (name, description) VALUES
        ('Cardiology', 'Heart-related issues'),
        ('Neurology', 'Brain-related issues'),
        ('Orthopedics', 'Bone and muscle disorders'),
        ('Pediatrics', 'Child healthcare'),
        ('Radiology', 'Imaging and diagnostics');
    `);
  
    // Insertar datos por defecto en Departments
    await dbClient.exec(`
      INSERT OR IGNORE INTO departments (name, location) VALUES
        ('Emergency', 'Building A, Floor 1'),
        ('Surgery', 'Building B, Floor 2'),
        ('Radiology', 'Building C, Floor 3'),
        ('Pediatrics', 'Building D, Floor 4');
    `);
  
    // Insertar datos por defecto en Department Services
    await dbClient.exec(`
      INSERT OR IGNORE INTO department_services (departmentId, service) VALUES
        (1, 'Trauma Care'),
        (1, 'Critical Care'),
        (2, 'General Surgery'),
        (2, 'Plastic Surgery'),
        (3, 'MRI Scans'),
        (3, 'X-Rays'),
        (4, 'Child Vaccinations'),
        (4, 'Growth Monitoring');
    `);
  
    // Insertar datos por defecto en Doctor Specialties
    await dbClient.exec(`
      INSERT OR IGNORE INTO doctor_specialties (doctorId, specialtyId) VALUES
        (1, 1), -- Doctor 1 es Cardiólogo
        (1, 2), -- Doctor 1 también es Neurólogo
        (2, 3), -- Doctor 2 es Ortopedista
        (3, 4), -- Doctor 3 es Pediatra
        (4, 5); -- Doctor 4 es Radiólogo
    `);
  

    await this.closeDatabase();
  }
}
