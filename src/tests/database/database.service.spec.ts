import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";
import { DatabaseService } from "../../database/database.service";

jest.mock("sqlite", () => ({
  open: jest.fn(() => ({
    exec: jest.fn(),
    close: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
  })),
}));

jest.mock("sqlite3", () => ({
  Database: jest.fn(),
}));

jest.mock("path", () => ({
  ...jest.requireActual("path"),
  join: jest.fn(() => "/mocked/path/to/database"),
}));

describe("DatabaseService", () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    databaseService = new DatabaseService();
  });

  afterEach(async () => {
    await databaseService.closeDatabase();
  });

  describe("openDatabase", () => {
    it("should open the database if not already opened", async () => {
      const db = await databaseService.openDatabase();
      expect(sqlite.open).toHaveBeenCalledWith({
        filename: "/mocked/path/to/database",
        driver: sqlite3.Database,
      });
      expect(db).toBeDefined();
    });

    it("should return the existing database instance if already opened", async () => {
      const mockDbInstance = {
        exec: jest.fn(),
        close: jest.fn(),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>;
      databaseService["db"] = mockDbInstance;

      const db = await databaseService.openDatabase();
      expect(db).toBe(mockDbInstance);
    });
  });

  describe("closeDatabase", () => {
    it("should close the database if it is open", async () => {
      const mockDbInstance = {
        close: jest.fn(),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>;
      databaseService["db"] = mockDbInstance;

      await databaseService.closeDatabase();
      expect(mockDbInstance.close).toHaveBeenCalled();
      expect(databaseService["db"]).toBeNull();
    });

    it("should do nothing if the database is not open", async () => {
      databaseService["db"] = null;
      await expect(databaseService.closeDatabase()).resolves.toBeUndefined();
    });
  });

  describe("execQuery", () => {
    it("should execute a read query and return rows", async () => {
      const mockDbInstance = {
        all: jest.fn().mockResolvedValue([{ id: 1, name: "Test" }]),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>;
      jest.spyOn(databaseService, "openDatabase").mockResolvedValue(mockDbInstance);

      const result = await databaseService.execQuery("SELECT * FROM users");
      expect(mockDbInstance.all).toHaveBeenCalledWith("SELECT * FROM users", []);
      expect(result).toEqual([{ id: 1, name: "Test" }]);
    });

    it("should execute a write query and return lastID and changes", async () => {
      const mockDbInstance = {
        run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>;
      jest.spyOn(databaseService, "openDatabase").mockResolvedValue(mockDbInstance);

      const result = await databaseService.execQuery("INSERT INTO users (name) VALUES (?)", ["John"]);
      expect(mockDbInstance.run).toHaveBeenCalledWith("INSERT INTO users (name) VALUES (?)", ["John"]);
      expect(result).toEqual({ lastID: 1, changes: 1 });
    });

    it("should close the database after execution", async () => {
      const mockClose = jest.spyOn(databaseService, "closeDatabase").mockImplementation(jest.fn());
      jest.spyOn(databaseService, "openDatabase").mockResolvedValue({
        all: jest.fn(),
        run: jest.fn(),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>);

      await databaseService.execQuery("SELECT * FROM users");
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("initializeDatabase", () => {
    it("should create necessary tables and insert default data", async () => {
      const mockDbInstance = {
        exec: jest.fn(),
      } as unknown as sqlite.Database<sqlite3.Database, sqlite3.Statement>;
      jest.spyOn(databaseService, "openDatabase").mockResolvedValue(mockDbInstance);

      await databaseService.initializeDatabase();

      expect(mockDbInstance.exec).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS users"));
      expect(mockDbInstance.exec).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS appointments"));
      expect(mockDbInstance.exec).toHaveBeenCalledWith(expect.stringContaining("INSERT OR IGNORE INTO users"));
    });
  });
});
